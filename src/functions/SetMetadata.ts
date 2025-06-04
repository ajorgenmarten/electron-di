import { SYMBOLS } from "../core/Symbols"

export function SetMetadata(key: string, value: any): ClassDecorator | MethodDecorator {
    return function (target, propertyKey, descriptor) {
        if (!propertyKey && !descriptor) {
            const metadata = Reflect.getMetadata(SYMBOLS.reflector, target) || {}
            metadata[key] = value
            Reflect.defineMetadata(SYMBOLS.reflector, metadata, target)
        }
        if (descriptor && typeof descriptor !== 'number') {
            const metadata = Reflect.getMetadata(SYMBOLS.reflector, target, propertyKey) || {}
            metadata[key] = value
            Reflect.defineMetadata(SYMBOLS.reflector, metadata, target, propertyKey)
        }
    }
}