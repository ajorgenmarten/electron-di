import { SYMBOLS } from "../core/Symbols"

export function Controller(prefix?: string): ClassDecorator {
    return function (target) {
        const controllerMetadata = prefix ? { prefix } : true
        Reflect.defineMetadata(SYMBOLS.controller, controllerMetadata, target)
    }
}