import { Class, GuardMetadata, MetadataHandler, Token } from "../core"

export function Before(guard: Token): ClassDecorator | MethodDecorator {
    return function (target, propertyKey) {
        const metadata: GuardMetadata = {
            provider: guard,
            type: 'after'
        }
        MetadataHandler.SetGuardMetadata(target as Class, metadata, propertyKey as string)
    }
}