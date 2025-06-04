import { ipcMain, IpcMainEvent, IpcMainInvokeEvent } from "electron";
import { Class, ExecutionContext, Guard, InstanceOf, ParamMetadata, Provider, Token } from "../types";
import { DependencyContainer } from "./Container";
import ReflectionHandler from "./ReflectionHandler";
import { Logger } from "./Logger";
class ParamResolver {
    static resolve(context: ExecutionContext, params: ParamMetadata) {
        return params.map(param => {
            switch(param) {
                case "event":
                    return context.ipcEvent
                case "payload":
                    return context.payload
                case "request":
                    return context
                default:
                    return null
            }
        })
    }
}
class App {
    private Logger = Logger.Logger
    constructor(private container: DependencyContainer) {
        this.RegisterHandlers()
    }

    private RegisterHandlers() {
        const controllers = Array.from(this.container.Controllers)

        for(const [controller_class, controller_info] of controllers) {
            const methods = Object.getOwnPropertyNames(controller_class.prototype).filter(name => name !== 'constructor')

            const dependencies_resolver = (dep: Token) => {
                return this.container.resolve(dep, controller_info.ScopeModule, { target: controller_class })
            }

            const controller_dependencies = controller_info.Dependencies.map(dependencies_resolver)
            
            const controller_instance = new controller_class(...controller_dependencies)

            for(const method of methods) {
                const handler_metadata = ReflectionHandler.getHandlerMetadata(controller_instance, method)

                if (!handler_metadata) continue;

                const [after_guards, before_guards] = ReflectionHandler.getGuardsMetadata(controller_instance, method)
                .reverse()
                .reduce((prev, curr) => {
                    if (curr.type === "after") prev[0].push(curr.token)
                    else prev[1].push(curr.token)
                    return prev
                }, [[], []] as [Token<Guard>[], Token<Guard>[]])

                const controller_guard_resolver = (guard: Token<Guard>) => {
                    return this.container.resolve(guard, controller_info.ScopeModule, {
                        target: controller_class
                    })
                }
                const handler_guard_resolver = (guard: Token<Guard>) => {
                    return this.container.resolve(guard, controller_info.ScopeModule, {
                        target: controller_class, property: method
                    })
                }

                const stack_after_guards = [...Array.from(controller_info.BeforeGuards).map(controller_guard_resolver), ...after_guards.map(handler_guard_resolver)]
                const stack_before_guards = [...Array.from(controller_info.BeforeGuards).map(controller_guard_resolver), ...before_guards.map(handler_guard_resolver)]

                console.log(stack_before_guards)

                const full_channel = [controller_info.Prefix, handler_metadata.channel].filter(Boolean).join(':')
            
                if(ipcMain.listeners(full_channel).length > 0) throw new Error(`Duplicate handler for channel: "${full_channel}"`)

                const ipc_handler = async (event: IpcMainInvokeEvent | IpcMainEvent, payload: any) => {
                    this.Logger.info(`[REQUESTED: ${full_channel}] -> (${controller_class.name}.${method})`)
                    
                    const context: ExecutionContext = {
                        ipcEvent: event,
                        payload: payload,
                        handler: controller_instance[method],
                        class: controller_instance
                    }

                    try {
                        for(const before_guard of stack_before_guards) {
                            const params = ReflectionHandler.getParamsMetadata(before_guard as any, 'execute')
                            const result = await before_guard.execute(...ParamResolver.resolve(context, params))
                            if (result === false) return { success: false }
                        }
                    } catch (error) {
                        const message = error instanceof Error ? error.message : "Internal Error"
                        this.Logger.error(`[${message}] [channel: ${full_channel}]`)
                        return { success: false, message, details: error }
                    }

                    const params = ReflectionHandler.getParamsMetadata(controller_instance, method)
                    let result;

                    try {
                        result = await controller_instance[method](...ParamResolver.resolve(context, params))
                    } catch (error) {
                        const message = error instanceof Error ? error.message : "Internal Error"
                        this.Logger.error(`[${message}] [channel: ${full_channel}]`)
                        return { success: false, message, details: error }
                    }

                    
                    Promise.all(stack_after_guards.map(after_guard => {
                        const params = ReflectionHandler.getParamsMetadata(after_guard as any, 'execute')
                        return after_guard.execute(...ParamResolver.resolve(context, params))
                    })).catch(error => {
                        const message = error instanceof Error ? error.message : "Internal Error"
                        this.Logger.error(`[${message}] [channel: ${full_channel}]`)
                        return { success: false, message, details: error }
                    })

                    return result

                }
                
                if (handler_metadata.type === "invoke") ipcMain.handle(full_channel, ipc_handler)
                else ipcMain.on(full_channel, ipc_handler)

                this.Logger.info(`[${handler_metadata.type.toUpperCase()}] [channel: ${full_channel}]`)
            }
        }
    }

    get Container() {
        return this.container;
    }
}

export class ElectronDI {
    static createApp(MainModule: Class) {
        const app = new App(new DependencyContainer(MainModule))
        return app;
    }
}

