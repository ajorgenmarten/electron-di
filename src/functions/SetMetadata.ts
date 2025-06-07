import { Class, MetadataHandler } from "../core"


export function SetMetadata(key: string, value: any): ClassDecorator | MethodDecorator {
    return function (target, propertyKey, descriptor) {
        if (!propertyKey && !descriptor) {
            const metadata = MetadataHandler.get(key, { cls: target as Class }) || {}
            metadata[key] = value
            MetadataHandler.define(key, metadata, { cls: target as Class })
        }
        if (descriptor && typeof descriptor !== 'number') {
            const metadata = MetadataHandler.get(key, { cls: target as Class, method: propertyKey as string }) || {}
            metadata[key] = value
            MetadataHandler.define(key, metadata, { cls: target as Class, method: propertyKey as string })
        }
    }
}