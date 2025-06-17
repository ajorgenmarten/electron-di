import { ipcMain, IpcMainEvent, IpcMainInvokeEvent } from "electron"
import { Container, ControllerInfo } from "./Container"
import { Logger } from "./Logger"
import { MetadataHandler } from "./MetadataHandler"
import { Class, GuardMetadata, ParamMetadata, Token } from "./types"

type ApplicationOptions = {
    logger?: boolean
    overloadHandler?: boolean
}

type ExecutionContext = {
    event: IpcMainInvokeEvent | IpcMainEvent
    payload: any
}

type CreateHandlerProps = {
    controllerInstance: any
    beforeGuards: any[]
    afterGuards: any[]
    fullChannel: string
    method: string
}

class Application {
    private options: ApplicationOptions = { logger: false, overloadHandler: false }
    private logger = Logger.Logger
    private container;

    constructor(module: Class, options?: ApplicationOptions) {
        if (options) this.options = {...this.options, ...options}
        this.container = new Container(module)
        this.registerHandlers()
    }

    private extractGuards(controller: ControllerInfo & { Class: Class }, method: string) {
        const controllerGuards = MetadataHandler.GetGuardMetadata(controller.Class) || []
        const handlerGuards = MetadataHandler.GetGuardMetadata(controller.Class, method) || []

        const separeGuardCallback = (previous: any[][], current: GuardMetadata) => {
            if (current.type === 'before') previous[0].push(current.provider)
            else previous[1].push(current.provider)
            return previous
        }

        const controllerGuardsSeparated = controllerGuards.reduce(separeGuardCallback, [[],[]])

        const handlerGuardSeparated = handlerGuards.reduce(separeGuardCallback, [[], []])

        const guardResolveControllerContext = (guard: Token) => this.container.resolve(guard, controller.Context, controller.Class )
        const guardResolveHandlerContext = (guard: Token) => this.container.resolve(guard, controller.Context, controller.Class, method )

        const beforeGuards = [
            ...controllerGuardsSeparated[0].map(guardResolveControllerContext),
            ...handlerGuardSeparated[0].map(guardResolveHandlerContext)
        ]

        const afterGuards = [
            ...controllerGuardsSeparated[1].map(guardResolveControllerContext),
            ...handlerGuardSeparated[1].map(guardResolveHandlerContext)
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
            const params: ParamMetadata[] = MetadataHandler.GetParamsMetadata(guard, 'execute') || []
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
            this.options.logger && this.logger.info(`[REQUESTED: ${props.fullChannel}] => ${props.controllerInstance.constructor.name}().${props.method}`)

            if(typeof payload !== 'object' && typeof payload !== 'undefined') {
                this.options.logger && this.logger.warn(`The payload isn't an object and will resolve to undefined`)
                payload = undefined
            }

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
                result = await props.controllerInstance[props.method](...this.resolveParams(params, executionContext))
            } catch (error) {
                return this.handleError(error, props.fullChannel)
            }

            this.executeAfterGuards(props.afterGuards, executionContext, props.fullChannel)

            this.options.logger && this.logger.debug(`[Result ${props.fullChannel}]`, result)

            return result;

        }
    }

    private registerHandlers() {
        for(const [controllerClass, controllerInfo] of this.container.Controllers) {
            const dependencies = MetadataHandler.GetParamTypes(controllerClass) ?? []
            const resolvedDependencies = dependencies.map(dependency => this.container.resolve(dependency, controllerInfo.Context, controllerClass))
            
            const controllerInstance = new controllerClass(...resolvedDependencies)
        
            const controllerMethods = Object.getOwnPropertyNames(controllerClass.prototype).filter(name => name !== "constructor")
            for (const controllerMethod of controllerMethods) {
                const handlerMetadata = MetadataHandler.GetHandlerMetadata(controllerInstance, controllerMethod)
                if (!handlerMetadata) continue

                const fullChannel = [controllerInfo.Prefix, handlerMetadata.channel].filter(Boolean).join(':')
                if (ipcMain.listeners(fullChannel).length > 0 && this.options.overloadHandler === false) 
                    throw new Error(`Duplicate handler for channel: "${fullChannel}"`)

                const { beforeGuards, afterGuards } = this.extractGuards({ ...controllerInfo, Class: controllerClass }, controllerMethod)

                const handler = this.createHandler({
                    beforeGuards,
                    afterGuards,
                    controllerInstance,
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
    static createApp(module: Class, options?: ApplicationOptions) {
        const app = new Application(module, options)
        return app
    }
}