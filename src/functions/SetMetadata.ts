export function SetMetadata(key: string, value: any): ClassDecorator | MethodDecorator {
    return function (target, propertyKey) {
        const symbol = Symbol.for(key)
        Reflect.defineMetadata(symbol, value, target, propertyKey)
    }
}