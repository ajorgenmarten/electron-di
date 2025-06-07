import { Class, GuardMetadata, MetadataHandler, Token } from "../core"

export function Before(...guards: Token[]): ClassDecorator | MethodDecorator {
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