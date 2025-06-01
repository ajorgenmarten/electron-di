import { SYMBOLS } from "../core/Symbols"
import { ParamMetadata } from "../types"

export function Request(): ParameterDecorator {
    return function (target, propertyKey, paramIndex) {
        const metadata: ParamMetadata = Reflect.getMetadata(SYMBOLS.params, target, propertyKey as string) || []
        metadata[paramIndex] = "request"
        Reflect.defineMetadata(SYMBOLS.params, metadata, target, propertyKey as string)
    }
}