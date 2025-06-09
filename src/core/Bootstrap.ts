import { ipcMain, IpcMainEvent, IpcMainInvokeEvent } from "electron";
import { Container } from "./Container";
import { MetadataHandler } from "./MetadataHandler";
import { Class, GuardMetadata, Token, ParamMetadata } from "./types";
import { Logger } from "./Logger";

type InitializedControllerInfo = {
    instance: any
    context: Class
    prefix: string
}

type ReflectorContext = {
    controller: Class
    handler?: string
}

type ApplicationOptions = {
    logger?: boolean
    overloadHandlers?: boolean
}

type CreateHandlerProps = {
    controllerInstance: any
    beforeGuards: any[]
    afterGuards: any[]
    fullChannel: string
    method: string
}

type ExecutionContext = {
    event: IpcMainInvokeEvent | IpcMainEvent
    payload: any
}

class Application {
    private guardsCache: Map<string, any> = new Map()
    private applicationOptions: ApplicationOptions = { logger: false, overloadHandlers: false }
    private logger = Logger.Logger

    constructor(private container: Container, options?: ApplicationOptions) { 
        this.applicationOptions = { ...this.applicationOptions, ...options }
        this.registerHandlers()
    }
    
    private initalizeControllers() {
        const initializedControllers = new Map<Class, InitializedControllerInfo>();

        for(const [controller, controllerInfo] of this.container.Controllers) {
            const dependencies = controllerInfo.Dependencies.map(dep => this.container.resolve(dep, controllerInfo.Context, { reflectorContext: { controller } }))
            const instance = new controller(...dependencies)
            initializedControllers.set(controller, { context: controllerInfo.Context, instance, prefix: controllerInfo.Prefix });
        }

        return initializedControllers
    }
    private resolveGuard(guard: Token, scope: Class, reflectorContext: ReflectorContext) {
        const cacheKey = `${guard.name}_${scope.name}_${reflectorContext.controller.name}_${reflectorContext.handler}`
        if (this.guardsCache.has(cacheKey)) return this.guardsCache.get(cacheKey);
        const resolvedGuard = this.container.resolve(guard, scope, { reflectorContext })
        this.guardsCache.set(cacheKey, resolvedGuard)
        return resolvedGuard
    }

    private extractGuards(initializedControllerInfo: InitializedControllerInfo, method: string) {
        const controllerGuards = MetadataHandler.GetGuardMetadata(initializedControllerInfo.instance.constructor) || []
        const handlerGuards = MetadataHandler.GetGuardMetadata(initializedControllerInfo.instance.constructor, method) || []

        const separeGuardCallback = (previous: any[][], current: GuardMetadata) => {
            if (current.type === 'before') previous[0].push(current.provider)
            else previous[1].push(current.provider)
            return previous
        }

        const controllerGuardsSeparated = controllerGuards.reduce(separeGuardCallback, [[],[]])

        const handlerGuardSeparated = handlerGuards.reduce(separeGuardCallback, [[], []])

        const guardResolveControllerContext = (guard: Token) => this.resolveGuard(guard, initializedControllerInfo.context, { controller: initializedControllerInfo.instance.constructor })
        const guardResolveHandlerContext = (guard: Token) => this.resolveGuard(guard, initializedControllerInfo.context, { controller: initializedControllerInfo.instance, handler: method })

        const beforeGuards = [
            ...controllerGuardsSeparated[0].map(guardResolveControllerContext).reverse(),
            ...handlerGuardSeparated[0].map(guardResolveHandlerContext).reverse()
        ]

        const afterGuards = [
            ...controllerGuardsSeparated[1].map(guardResolveControllerContext).reverse(),
            ...handlerGuardSeparated[1].map(guardResolveHandlerContext).reverse()
        ]

        return { beforeGuards, afterGuards }
    }

    private resolveParams(params: ParamMetadata[], executionContext: ExecutionContext) {
        return params.map(param => {
            if (param === 'event') return executionContext.event
            if (param === 'payload') return executionContext.payload
            if (param === 'request') return executionContext
            return undefined
        })
    }

    private async executeBeforeGuards(guards: any[], context: ExecutionContext) {
        for(const guard of guards) {
            const params: ParamMetadata[] = MetadataHandler.GetParamsMetadata(guard.constructor, 'execute') || []
            const result = await guard.execute(...this.resolveParams(params, context))
            if (result === false) return false
        }
        return true
    }

    private async executeAfterGuards(guards: any[], context: ExecutionContext, channel: string) {
        Promise.all(guards.map(guard => {
            const params = MetadataHandler.GetParamsMetadata(guard, 'execute') || []
            return guard.execute(...this.resolveParams(params, context))
        })).catch(error => {
            this.handleError(error, channel)
        })
    }

    private handleError(error: unknown, channel: string) {
        const message = error instanceof Error ? error.message : "Internal Error"
        this.logger.error(`[channel: ${channel}] ${message}`)
        return { success: false, message, details: error }
    }

    private createHandler(props: CreateHandlerProps) {
        return async (event: IpcMainInvokeEvent | IpcMainEvent, payload: any) => {
            this.applicationOptions.logger && this.logger.info(`[${props.fullChannel}] => ${props.controllerInstance.constructor.name}().${props.method}`)

            const executionContext: ExecutionContext = { event, payload }

            try {
                const result = await this.executeBeforeGuards(props.beforeGuards, executionContext)
                if (result === false) return { success: false }
            } catch (error) {
                return this.handleError(error, props.fullChannel)
            }

            let result;
            
            try {
                const params = MetadataHandler.GetParamsMetadata(props.controllerInstance, props.method) || []
                result = props.controllerInstance[props.method](...this.resolveParams(params, executionContext))
            } catch (error) {
                return this.handleError(error, props.fullChannel)
            }

            this.executeAfterGuards(props.afterGuards, executionContext, props.fullChannel)

            this.applicationOptions.logger && this.logger.debug(`[Result ${props.fullChannel}]`, result)

            return result;

        }
    }

    private registerHandlers() {
        const initializedControllers = this.initalizeControllers()

        for (const [controllerClass, initializedControllerInfo] of initializedControllers) {
            const controllerMethods = Object.getOwnPropertyNames(controllerClass.prototype).filter(name => name !== 'constructor')

            for (const controllerMethod of controllerMethods) {
                const handlerMetadata = MetadataHandler.GetHandlerMetadata(initializedControllerInfo.instance, controllerMethod)

                if (!handlerMetadata) continue

                const { beforeGuards, afterGuards } = this.extractGuards(initializedControllerInfo, controllerMethod)

                const fullChannel = [initializedControllerInfo.prefix, handlerMetadata.channel].filter(Boolean).join(':')

                if(ipcMain.listeners(fullChannel).length > 0 && this.applicationOptions.overloadHandlers === false)
                    throw new Error(`Duplicate handler for channel: "${fullChannel}"`)

                const handler = this.createHandler({
                    afterGuards,
                    beforeGuards,
                    controllerInstance: initializedControllerInfo.instance,
                    fullChannel,
                    method: controllerMethod
                })

                if (handlerMetadata.type === 'invoke') ipcMain.handle(fullChannel, handler)
                else ipcMain.on(fullChannel, handler)

                this.logger.info(`[${handlerMetadata.type.toUpperCase()}] [channel: ${fullChannel}]`)
            }
        }
    }
}

export class ElectronDI {
    static createApp(moduleInit: Class, options?: ApplicationOptions) {
        const app = new Application(new Container(moduleInit), options)
        return app
    }
}