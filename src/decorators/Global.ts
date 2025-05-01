import symbols from "@core/constants";
import { GlobalMetadata } from "@typedefs/metadata.types";
import { Class } from "@typedefs/general.types";

/**
 * Decorador que marca un moduleo como global.
 * Cuando una clase es marcada como global, estará disponible en todos los contextos de la aplicación.
 *
 * @example
 * ```typescript
 * |@Global()
 * |@Module({
 *   providers: [UserService],
 *   exports: [UserService],
 * })
 * class MyGlobalModule { }
 * ```
 *
 * @returns {Function} Decorador que puede ser aplicado a una clase
 */

export function Global() {
  return function (target: Class) {
    const metadata: GlobalMetadata = true;
    Reflect.defineMetadata(symbols.global, metadata, target);
  };
}
