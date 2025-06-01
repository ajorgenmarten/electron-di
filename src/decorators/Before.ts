import { SYMBOLS } from "../core/Symbols"
import { MiddlewareMetadata, Token } from "../types"

export function After(...middlewares: Token[]): ClassDecorator | MethodDecorator {
    return function (target, propertyKey) {
        const metadatas: MiddlewareMetadata[] = Reflect.getMetadata(SYMBOLS.middleware, target, propertyKey) || []
        for (const middleware of middlewares) {
            metadatas.push({
                level: typeof propertyKey === "undefined" ? "class" : "method",
                type: "before",
                token: middleware
            })
        }
        
    }
}