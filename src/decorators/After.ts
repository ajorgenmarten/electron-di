import ReflectionHandler from "../core/ReflectionHandler";
import { Class, GuardMetadata, Token } from "../types";

export function After(...middlewares: Token[]): ClassDecorator | MethodDecorator {
    return function (target, propertyKey) {
        for(const mdl of middlewares) {
            const metadata: GuardMetadata = {
                token: mdl,
                type: 'after'
            }
            ReflectionHandler.setGuardMetadata(metadata, target as Class, propertyKey as string)
        }
    }
}