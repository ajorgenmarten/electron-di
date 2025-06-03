import ReflectionHandler from "../core/ReflectionHandler";
import { Class, ModuleMetadata } from "../types";

export function Module(options: ModuleMetadata): ClassDecorator {
    return function (target: Object) {
        ReflectionHandler.setModuleMetadata(options, target as Class)
    }
}