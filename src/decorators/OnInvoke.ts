import { Class, HandlerMetadata, MetadataHandler } from "../core"


export function OnInvoke(channel: string): MethodDecorator {
    return function (target: Object, propertyKey) {
        const metadata: HandlerMetadata = {
            channel,
            type: "invoke",
        }
        MetadataHandler.SetHandlerMetadata(target as Class, propertyKey as string, metadata)
    }
}