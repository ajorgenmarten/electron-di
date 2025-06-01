import { SYMBOLS } from "../core/Symbols"

export function Global(): ClassDecorator {
    return function (target) {
        Reflect.defineMetadata(SYMBOLS.global, true, target)
    }
}