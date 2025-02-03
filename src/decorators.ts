import { DEFINE_ELECTRON_METADATA, DEFINE_MODULE_OPTIONS, DEFINE_PREFIX_CONTROLLER, INJECT_CONSTRUCTOR } from "./constants"
import { container } from "./container"
import { IAbstractClass, IClass, IControllerMetadata, IElectronMetadata, IInjectMetadata, IModuleOptions } from "./types"

export function Inject(token: IClass | IAbstractClass) {
    return function (target: IClass, _propertyKey: string | undefined, paramIndex: number) {
        let metadata: IInjectMetadata = Reflect.getMetadata(INJECT_CONSTRUCTOR, target)
        if (!metadata) metadata = { constructParams: [] }
        metadata.constructParams[paramIndex] = token
        Reflect.defineMetadata(INJECT_CONSTRUCTOR, metadata, target)
    }
}

export function Injectable() {
    return function (target: IClass) {
        container.register(target.name, target)
    }
}

export function Controller(prefix?: string) {
    return function (target: IClass) {
        const metadata: IControllerMetadata = { prefix }
        Reflect.defineMetadata(DEFINE_PREFIX_CONTROLLER, metadata, target)
        container.register(target.name, target)
    }
}

export function OnInvoke(channel: string) {
    return function (target: any, propertyKey: string) {
        let metadata: IElectronMetadata | undefined = Reflect.getMetadata(DEFINE_ELECTRON_METADATA, target)
        const decorate: IElectronMetadata['decorates'][0] = { channel, method: propertyKey, type: 'invoke'}
        if (metadata) metadata.decorates.push(decorate)
        else metadata = { decorates: [decorate] }
        Reflect.defineMetadata(DEFINE_ELECTRON_METADATA, metadata, target)
    }
}

export function OnSend(channel: string) {
    return function (target: any, propertyKey: string) {
        let metadata: IElectronMetadata | undefined = Reflect.getMetadata(DEFINE_ELECTRON_METADATA, target)
        const decorate: IElectronMetadata['decorates'][0] = { channel, method: propertyKey, type: 'send'}
        if (metadata) metadata.decorates.push(decorate)
        else metadata = { decorates: [decorate] }
        Reflect.defineMetadata(DEFINE_ELECTRON_METADATA, metadata, target)
    }
}

export function Module(options: IModuleOptions) {
    return function (target: IClass) {
        Reflect.defineMetadata(DEFINE_MODULE_OPTIONS, options, target)
    }
}