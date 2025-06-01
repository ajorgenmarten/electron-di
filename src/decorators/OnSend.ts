import { SYMBOLS } from "../core/Symbols"
import { HandlerMetadata } from "../types"

export function OnSend(channel: string): MethodDecorator {
    return function (target, propertyKey, descriptor) {
        const handlerMetadata: HandlerMetadata = {
            type: "send",
            channel: channel
        }
        Reflect.defineMetadata(SYMBOLS.handler, target, handlerMetadata, propertyKey)
    }
}