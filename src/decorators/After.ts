import { MetadataHandler, GuardMetadata, Token, Class } from "../core";

export function After(guard: Token): ClassDecorator | MethodDecorator {
    return function (target, propertyKey) {
        const metadata: GuardMetadata = {
            provider: guard,
            type: 'after'
        }
        MetadataHandler.SetGuardMetadata(target as Class, metadata, propertyKey as string)
    }
}