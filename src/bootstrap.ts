import { ipcMain } from "electron";
import { container } from "./container";
import { IClass, IControllerMetadata, IElectronMetadata, IModuleOptions } from "./types";
import { DEFINE_ELECTRON_METADATA, DEFINE_MODULE_OPTIONS, DEFINE_PREFIX_CONTROLLER } from "./constants";

export function Bootstrap(...modules: IClass[]) {
    for (const module of modules) {
        const { providers, controllers }: IModuleOptions = Reflect.getMetadata(DEFINE_MODULE_OPTIONS, module)
        providers?.forEach(function (provider) {
            if (typeof provider === "function") return;
            container.updateToken(provider.provide.name, provider.useClass)
        })
        controllers?.forEach(function (controller) {
            const { prefix }: IControllerMetadata = Reflect.getMetadata(DEFINE_PREFIX_CONTROLLER, controller)
            const { decorates }: IElectronMetadata = Reflect.getMetadata(DEFINE_ELECTRON_METADATA, controller.prototype)
            const resolved = container.resolveDepenedency(controller.name)
            for(const decorate of decorates) {
                const channel = prefix ? `${prefix}:${decorate.channel}` : decorate.channel
                const handler = resolved[decorate.method];
                const newFunc = (handler as Function).bind(resolved)
                if (decorate.type === "invoke")
                    ipcMain.handle(channel, async function (event, ...args) {
                        const returnValue = await newFunc(event, ...args)
                        return returnValue
                    })
                if (decorate.type === "send")
                    ipcMain.on(channel, async function (event, ...args) {
                        await newFunc(event, ...args)
                    })
            }
        })
    }
}