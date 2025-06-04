import ReflectionHandler from "../core/ReflectionHandler"
import { Class, GuardMetadata, Token } from "../types"

export function Before(...guards: Token[]): ClassDecorator | MethodDecorator {
    return function (target, propertyKey) {
        for(const gds of guards) {
            const metadata: GuardMetadata = {
                token: gds,
                type: 'before'
            }
            ReflectionHandler.setGuardMetadata(metadata, target as Class, propertyKey as string)
        }
    }
}