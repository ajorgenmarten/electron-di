import { INJECTION_IPCMETHOD_SYMBOL } from "@core/constants"
import { IPCMetadata } from "@core/metadata"
import { ApplyToMethod } from "@decorators/restrictions/apply-to-method"
import { NoDecorateBy } from "@decorators/restrictions/no-decorate-by"

export function OnSend(path: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        ApplyToMethod(target, descriptor, "@OnSend")
        NoDecorateBy(target, '@OnSend', INJECTION_IPCMETHOD_SYMBOL)
        const metadata: IPCMetadata = { ipcmethod: "send", path }
        Reflect.defineMetadata(INJECTION_IPCMETHOD_SYMBOL, metadata, target, propertyKey)
    }
}