import { SYMBOLS } from "../core/Symbols"
import { HandlerMetadata } from "../types"

export function OnInvoke(channel: string): MethodDecorator {
    return function (target, propertyKey, descriptor) {
        const handlerMetadata: HandlerMetadata = {
            type: "invoke",
            channel: channel
        }
        Reflect.defineMetadata(SYMBOLS.handler, target, handlerMetadata, propertyKey)
    }
}