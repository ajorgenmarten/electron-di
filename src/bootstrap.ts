import { ipcMain } from "electron";
import { container } from "./container";
import { IClass, IDecorateMetadata, IModuleOptions } from "./types";
import { CLASS_METADATA_KEY } from "./constants";
import { ElectronDIError, Logger } from "./utils";

export function Bootstrap(...modules: IClass[]) {
    for (const module of modules) {
        // OBTENER METADATA
        const { options }: IDecorateMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, module)
        container.registerModule(module);
        options?.controllers?.forEach(function(controller) {
            // OBTENER METADATA DEL CONTROLADOR
            const { type, prefix }: IDecorateMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, controller)
            if (type !== 'controller') throw new ElectronDIError(`Decorate class "${controller.name}" with @Controller`)
            const resolved = container.resolveDependency(module, controller)
            const { decorates }: IDecorateMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, resolved)
            decorates?.forEach(function(value) {
                const channel = prefix ? `${prefix}:${value.channel}` : value.channel
                const method = resolved[value.method]
                const handler = method.bind(resolved)
                if (value.type === "invoke") {
                    ipcMain.handle(channel, async function (event, ...args) {
                        const returnValue = await handler(event, ...args)
                        return returnValue
                    })
                }
                if (value.type === "send") {
                    ipcMain.on(channel, async function (event, ...args) {
                        await handler(event, ...args)
                    })
                }
                Logger(`Listen for ipc.${value.type} in channel: ${channel}`)
            })
        })
    }    
}