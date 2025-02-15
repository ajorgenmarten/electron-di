import { INJECTION_CONTROLLER_SYMBOL, INJECTION_GLOBAL_SYMBOL, INJECTION_MODULE_SYMBOL, INJECTION_PROVIDER_SYMBOL } from "@core/constants"
import { GlobalMetadata } from "@core/metadata";
import { ApplyToClass } from "@decorators/restrictions/apply-to-class";
import { HasDecorateBy } from "@decorators/restrictions/has-decorate-by";
import { NoDecorateBy } from "@decorators/restrictions/no-decorate-by";

/**
 * Decora un modulo para que sus clases exportadas puedan ser usadas de manera global
 * @example
 * 
 * import { Global } from "electron-di";
 * 
 * [@Global()]
 * [@Module]({
 *   providers: [AuthService, AuthRepository],
 *   controllers: [AuthController]
 *   exports: [AuthService, AuthRepository]
 * })
 * export class AuthModule {}
 */
export function Global() {
    return function (target: Function) {
        ApplyToClass(target, "@Global")
        NoDecorateBy(target, "@Global", INJECTION_PROVIDER_SYMBOL, INJECTION_CONTROLLER_SYMBOL)
        HasDecorateBy(target, "@Module", INJECTION_MODULE_SYMBOL)
        const globalMetadata: GlobalMetadata = true;
        Reflect.defineMetadata(INJECTION_GLOBAL_SYMBOL, globalMetadata, target);
    }
}