import { Class, MetadataHandler } from "../core"


export function SetMetadata(key: string, value: any): ClassDecorator | MethodDecorator {
    return function (target, propertyKey, descriptor) {
        if (!propertyKey && !descriptor) {
            MetadataHandler.SetSetMetadata(target as Class, key, value)
        }
        if (descriptor && typeof descriptor !== 'number') {
            MetadataHandler.SetSetMetadata(target as Class, key, value, propertyKey as string)
        }
    }
}