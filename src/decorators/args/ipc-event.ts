import { ApplyToArguments } from "@decorators/restrictions/apply-to-arguments"

export function IPCEvent() {
    return function (target: any, propertyKey: string, paramIndex: number) {
        ApplyToArguments(paramIndex, "@IPCEvent")
        
    }
}