import { INJECTION_INJECT_SYMBOL } from "@core/constants";
import { InjectConstructorMetadata } from "@core/metadata";
import { Token } from "@core/types";
import { ApplyToArguments } from "@decorators/restrictions/apply-to-arguments";
import { ApplyToConstructorArgs } from "@decorators/restrictions/apply-to-constructor-args";

export function Inject(token: Token) {
    return function (target: any, propertyKey: undefined, paramIndex: number) { 
        ApplyToArguments(paramIndex, "@Inject")
        ApplyToConstructorArgs(target, propertyKey, paramIndex, "@Inject")
        let metadata: InjectConstructorMetadata = Reflect.getMetadata(INJECTION_INJECT_SYMBOL, target)
        if (typeof metadata === 'undefined') metadata = { tokens: [] }
        metadata.tokens[paramIndex] = token
        Reflect.defineMetadata(INJECTION_INJECT_SYMBOL, metadata, target)
    }
}