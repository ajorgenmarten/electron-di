import { SYMBOLS } from "../core/Symbols"

export function Event(): ParameterDecorator {
    return function(target, propertyKey, paramIndex) {
        const params = Reflect.getMetadata(SYMBOLS.params, target, propertyKey as string) || []
        params[paramIndex] = "event"
        Reflect.defineMetadata(SYMBOLS.params, params, target, propertyKey as string)
    }
}