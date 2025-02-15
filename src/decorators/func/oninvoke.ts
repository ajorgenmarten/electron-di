import { INJECTION_IPCMETHOD_SYMBOL } from "@core/constants"
import { IPCMetadata } from "@core/metadata"
import { ApplyToMethod } from "@decorators/restrictions/apply-to-method"
import { NoDecorateBy } from "@decorators/restrictions/no-decorate-by"

export function OnInvoke(path: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        ApplyToMethod(target, descriptor, "@OnInvoke")
        NoDecorateBy(target, '@OnInvoke', INJECTION_IPCMETHOD_SYMBOL)
        const metadata: IPCMetadata = { ipcmethod: "invoke", path }
        Reflect.defineMetadata(INJECTION_IPCMETHOD_SYMBOL, metadata, target, propertyKey)
    }
}