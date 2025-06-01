import { SYMBOLS } from "../core/Symbols"

export function Injectable(): ClassDecorator {
    return function (target) {
        Reflect.defineMetadata(SYMBOLS.provider, true, target)
    }
}