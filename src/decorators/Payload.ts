import { SYMBOLS } from "../core/Symbols"
import { ParamMetadata } from "../types"

export function Payload(): ParameterDecorator {
    return function (target, propertyKey, paramIndex) {
        const metadata: ParamMetadata = Reflect.getMetadata(SYMBOLS.params, target, propertyKey as string) || []
        metadata[paramIndex] = "payload"
        Reflect.defineMetadata(SYMBOLS.params, metadata, target, propertyKey as string)
    }
}