import { INJECTION_CONTROLLER_SYMBOL, INJECTION_GLOBAL_SYMBOL, INJECTION_MODULE_SYMBOL, INJECTION_PROVIDER_SYMBOL } from "@core/constants"
import { ControllerMetadata } from "@core/metadata"
import { ApplyToClass } from "@decorators/restrictions/apply-to-class"
import { NoDecorateBy } from "@decorators/restrictions/no-decorate-by"

export function Controller(prefix?: string) {
    return function (target: any) {
        ApplyToClass(target, "@Controller")
        NoDecorateBy(target, "@Controller", INJECTION_PROVIDER_SYMBOL, INJECTION_MODULE_SYMBOL, INJECTION_GLOBAL_SYMBOL)
        const metadata: ControllerMetadata = {
            isInjectable: true,
            prefix
        }
        Reflect.defineMetadata(INJECTION_CONTROLLER_SYMBOL, metadata, target)
    }
}