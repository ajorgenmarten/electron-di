import { ipcMain } from "electron";
import { container } from "./container";
import { IAbstractClass, IClass, IDecorateMetadata, IMiddlewareMethod } from "./types";
import { CLASS_METADATA_KEY } from "./constants";
import { ElectronDIError, Logger } from "./utils";

/**
 * Inicializa y configura los módulos y sus controladores.
 * @param modules Lista de clases de módulos a inicializar.
 */
export function Bootstrap(...modules: IClass[]) {
    for (const module of modules) {
        // Obtener la metadata del módulo.
        const { options }: IDecorateMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, module);
        
        // Registrar el módulo en el contenedor de dependencias.
        container.registerModule(module);

        // Registrar controladores definidos en las opciones del módulo.
        options?.controllers?.forEach(function(controller) {
            // Obtener la metadata del controlador.
            const { type, prefix, middleware: classMiddlewares }: IDecorateMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, controller);

            // Verificar si la clase está decorada como controlador.
            if (type !== 'controller') throw new ElectronDIError(`Decorate class "${controller.name}" with @Controller`);
            
            // Resolver la dependencia del controlador.
            const resolved = container.resolveDependency(module, controller);
            
            // Obtener la metadata de decoradores del controlador resuelto.
            const { decorates, middleware: methodMiddlewares }: IDecorateMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, resolved);

            // Registrar manejadores para los canales IPC definidos en los decoradores.
            decorates?.forEach(function(value) {
                const channel = prefix ? `${prefix}:${value.channel}` : value.channel;
                const method = resolved[value.method];
                const handler = method.bind(resolved);
                const middlewares = (methodMiddlewares as IMiddlewareMethod[])?.filter(function (m) {
                    return m.method === value.method;
                })

                async function excecuteClassMiddlewares(event: any, ...args: any[]): Promise<boolean> {
                    if (!Array.isArray(classMiddlewares)) return true;
                    for (const middleware of (classMiddlewares as (IClass | IAbstractClass)[])) {
                        const middlewareHandler = container.resolveDependency(module, middleware);
                        const result = await middlewareHandler.execute(event, ...args);
                        if (result === false) return false;
                    }
                    return true;
                }

                async function excecuteMethodMiddlewares(event: any, ...args: any[]): Promise<boolean> {
                    if (!Array.isArray(middlewares)) return true;
                    for (const middleware of middlewares) {
                        const middlewareHandler = container.resolveDependency(module, middleware.token);
                        const result = await middlewareHandler.execute(event, ...args);
                        if (result === false) return false;
                    }
                    return true;
                }

                async function excecuteMiddlewares(event: any, ...args: any[]): Promise<boolean> {
                    const classMiddlewaresResult = await excecuteClassMiddlewares(event, ...args);
                    if (classMiddlewaresResult === false) return false;

                    const methodMiddlewaresResult = await excecuteMethodMiddlewares(event, ...args);
                    if (methodMiddlewaresResult === false) return false;

                    return true;
                }

                // Registrar manejador para el tipo "invoke".
                if (value.type === "invoke") {
                    ipcMain.handle(channel, async function (event, ...args) {
                        const result = await excecuteMiddlewares(event, ...args);
                        if (result === false) return;
                        const returnValue = await handler(event, ...args);
                        return returnValue;
                    });
                }
                // Registrar manejador para el tipo "send".
                if (value.type === "send") {
                    ipcMain.on(channel, async function (event, ...args) {
                        const result = await excecuteMiddlewares(event, ...args);
                        if (result === false) return;
                        await handler(event, ...args);
                    });
                }

                Logger.info(`type: [${value.type}] channel: [${channel}] controller: [${controller.name}] method: [${value.method}]`, 'IPC Listener');
            });
        });
    }    
}
