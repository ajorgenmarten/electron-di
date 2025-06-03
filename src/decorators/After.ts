import ReflectionHandler from "../core/ReflectionHandler";
import { Class, MiddlewareMetadata, Token } from "../types";

export function After(...middlewares: Token[]): ClassDecorator | MethodDecorator {
    return function (target, propertyKey) {
        for(const mdl of middlewares) {
            const metadata: MiddlewareMetadata = {
                token: mdl,
                type: 'after'
            }
            ReflectionHandler.setMiddlewareMetadata(metadata, target as Class, propertyKey as string)
        }
    }
}