import { MetadataHandler, GuardMetadata, Token, Class } from "../core";

export function After(...guards: Token[]): ClassDecorator | MethodDecorator {
    return function (target, propertyKey) {
        for(const mdl of guards) {
            const metadata: GuardMetadata = {
                provider: mdl,
                type: 'after'
            }
            MetadataHandler.SetGuardMetadata(target as Class, metadata, propertyKey as string)
        }
    }
}