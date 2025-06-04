import { ipcMain, IpcMainEvent, IpcMainInvokeEvent } from "electron";
import { Class, ExecutionContext, Guard, InstanceOf, ParamMetadata, Provider, Token } from "../types";
import { ControllerRegister, DependencyContainer } from "./Container";
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

    /**
     * Crea un resolvedor de dependencias para un controlador específico
     */
    private createDependencyResolver(controllerClass: Class, scopeModule: Class) {
        return (dep: Token) => {
            return this.container.resolve(dep, scopeModule, { target: controllerClass })
        }
    }

    /**
     * Extrae y organiza los guardias de un controlador y método
     */
    private extractGuards(controllerInstance: any, method: string, controllerInfo: ControllerRegister, controllerClass: Class) {
        const [after_guards, before_guards] = ReflectionHandler.getGuardsMetadata(controllerInstance, method)
            .reverse()
            .reduce((prev, curr) => {
                if (curr.type === "after") prev[0].push(curr.token)
                else prev[1].push(curr.token)
                return prev
            }, [[], []] as [Token<Guard>[], Token<Guard>[]])

        const controller_guard_resolver = (guard: Token<Guard>) => {
            return this.container.resolve(guard, controllerInfo.ScopeModule, {
                target: controllerClass
            })
        }
        
        const handler_guard_resolver = (guard: Token<Guard>) => {
            return this.container.resolve(guard, controllerInfo.ScopeModule, {
                target: controllerClass, property: method
            })
        }

        const stack_after_guards = [...Array.from(controllerInfo.BeforeGuards).map(controller_guard_resolver), 
                                   ...after_guards.map(handler_guard_resolver)]
        
        const stack_before_guards = [...Array.from(controllerInfo.BeforeGuards).map(controller_guard_resolver), 
                                    ...before_guards.map(handler_guard_resolver)]

        return { stack_after_guards, stack_before_guards }
    }

    /**
     * Crea un manejador IPC para un método de controlador
     */
    private createIpcHandler(controllerInstance: any, method: string, full_channel: string, 
                           controllerClass: Class, stack_before_guards: Guard[], stack_after_guards: Guard[]) {
        
        return async (event: IpcMainInvokeEvent | IpcMainEvent, payload: any) => {
            this.Logger.info(`[REQUESTED: ${full_channel}] -> (${controllerClass.name}.${method})`)
            
            const context: ExecutionContext = {
                ipcEvent: event,
                payload: payload,
                handler: controllerInstance[method],
                class: controllerInstance
            }

            // Ejecutar guardias previos
            try {
                const beforeResult = await this.executeBeforeGuards(stack_before_guards, context)
                if (beforeResult === false) return { success: false }
            } catch (error) {
                return this.handleError(error, full_channel)
            }

            // Ejecutar el método del controlador
            let result;
            try {
                const params = ReflectionHandler.getParamsMetadata(controllerInstance, method)
                result = await controllerInstance[method](...ParamResolver.resolve(context, params))
            } catch (error) {
                return this.handleError(error, full_channel)
            }

            // Ejecutar guardias posteriores
            this.executeAfterGuards(stack_after_guards, context, full_channel)

            return result
        }
    }

    /**
     * Ejecuta los guardias previos a un método
     */
    private async executeBeforeGuards(guards: Guard[], context: ExecutionContext) {
        for(const guard of guards) {
            const params = ReflectionHandler.getParamsMetadata(guard as any, 'execute')
            const result = await guard.execute(...ParamResolver.resolve(context, params))
            if (result === false) return false
        }
        return true
    }

    /**
     * Ejecuta los guardias posteriores a un método
     */
    private executeAfterGuards(guards: Guard[], context: ExecutionContext, channel: string) {
        Promise.all(guards.map(guard => {
            const params = ReflectionHandler.getParamsMetadata(guard as any, 'execute')
            return guard.execute(...ParamResolver.resolve(context, params))
        })).catch(error => {
            this.handleError(error, channel)
            return { success: false }
        })
    }

    /**
     * Maneja errores de ejecución
     */
    private handleError(error: any, channel: string) {
        const message = error instanceof Error ? error.message : "Internal Error"
        this.Logger.error(`[${message}] [channel: ${channel}]`)
        return { success: false, message, details: error }
    }

    /**
     * Registra los manejadores para todos los controladores
     */
    private RegisterHandlers() {
        const controllers = Array.from(this.container.Controllers)

        for(const [controller_class, controller_info] of controllers) {
            // Obtener métodos del controlador
            const methods = Object.getOwnPropertyNames(controller_class.prototype).filter(name => name !== 'constructor')

            // Resolver dependencias del controlador
            const dependencies_resolver = this.createDependencyResolver(controller_class, controller_info.ScopeModule)
            const controller_dependencies = controller_info.Dependencies.map(dependencies_resolver)
            
            // Instanciar el controlador
            const controller_instance = new controller_class(...controller_dependencies)

            // Procesar cada método del controlador
            for(const method of methods) {
                const handler_metadata = ReflectionHandler.getHandlerMetadata(controller_instance, method)
                if (!handler_metadata) continue;

                // Extraer y organizar guardias
                const { stack_after_guards, stack_before_guards } = 
                    this.extractGuards(controller_instance, method, controller_info, controller_class)

                // Construir el canal completo
                const full_channel = [controller_info.Prefix, handler_metadata.channel].filter(Boolean).join(':')
            
                // Verificar duplicados
                if(ipcMain.listeners(full_channel).length > 0) {
                    throw new Error(`Duplicate handler for channel: "${full_channel}"`)
                }

                // Crear y registrar el manejador IPC
                const ipc_handler = this.createIpcHandler(
                    controller_instance, method, full_channel, 
                    controller_class, stack_before_guards, stack_after_guards
                )
                
                if (handler_metadata.type === "invoke") {
                    ipcMain.handle(full_channel, ipc_handler)
                } else {
                    ipcMain.on(full_channel, ipc_handler)
                }

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

