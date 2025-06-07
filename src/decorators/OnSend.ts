import { Class, HandlerMetadata, MetadataHandler } from "../core"


export function OnSend(channel: string): MethodDecorator {
    return function (target: Object, propertyKey) {
        const metadata: HandlerMetadata = {
            channel,
            type: "send",
        }
        MetadataHandler.SetHandlerMetadata(target as Class, propertyKey as string, metadata)
    }
}