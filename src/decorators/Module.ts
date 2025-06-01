import { SYMBOLS } from "../core/Symbols";
import { ModuleMetadata } from "../types";

export function Module(options: ModuleMetadata): ClassDecorator {
    return function (target) {
        Reflect.defineMetadata(SYMBOLS.module, options, target)
    }
}