import { Class, ModuleOptions } from "@core/types";
import { INJECTION_MODULE_SYMBOL } from "@core/constants"
import { ApplyToClass } from "@decorators/restrictions/apply-to-class";
import { ModuleMetadata } from "@core/metadata";

export function Module(options: ModuleOptions) {
    return function (target: Class) {
        ApplyToClass(target, "@Module")
        const moduleMetadata: ModuleMetadata = { options };
        Reflect.defineMetadata(INJECTION_MODULE_SYMBOL, moduleMetadata, target);
    }
}