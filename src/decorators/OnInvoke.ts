import ReflectionHandler from "../core/ReflectionHandler"
import { Class, HandlerMetadata } from "../types"

export function OnInvoke(channel: string): MethodDecorator {
    return function (target: Object, propertyKey, descriptor) {
        const metadata: HandlerMetadata = {
            channel,
            type: "invoke",
        }
        ReflectionHandler.setHandlerMetadata(metadata, target as Class, propertyKey as string)
    }
}