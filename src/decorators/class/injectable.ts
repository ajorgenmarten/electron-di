import { InjectableMetadata } from '@core/metadata';
import { INJECTION_CONTROLLER_SYMBOL, INJECTION_GLOBAL_SYMBOL, INJECTION_MODULE_SYMBOL, INJECTION_PROVIDER_SYMBOL } from "@core/constants"
import { ApplyToClass } from "@decorators/restrictions/apply-to-class"
import { NoDecorateBy } from "@decorators/restrictions/no-decorate-by"

export function Injectable() {
    return function (target: any) {
        ApplyToClass(target, "@Injectable")
        NoDecorateBy(target, "@Injectable", INJECTION_CONTROLLER_SYMBOL, INJECTION_MODULE_SYMBOL, INJECTION_GLOBAL_SYMBOL)
        const injectableMetadata: InjectableMetadata = true
        Reflect.defineMetadata(INJECTION_PROVIDER_SYMBOL, injectableMetadata, target)
    }
}