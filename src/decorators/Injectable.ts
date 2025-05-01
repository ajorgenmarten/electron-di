import { InjectableMetadata } from "@typedefs/metadata.types";
import symbols from "@core/constants";
import { Class } from "@typedefs/general.types";

/**
 * Decorador que marca una clase como inyectable.
 * Permite que la clase sea gestionada por el contenedor de inyección de dependencias.
 *
 * @example
 * ```typescript
 * |@Injectable()
 * class MyService {
 *   // ...
 * }
 * ```
 *
 * Al marcar una clase con @Injectable(), esta puede ser:
 * - Inyectada automáticamente en otras clases
 * - Instanciada por el contenedor de DI
 * - Gestionada su ciclo de vida por el contenedor
 */

export function Injectable() {
  return function (target: Class) {
    const metadata: InjectableMetadata = true;
    Reflect.defineMetadata(symbols.injectable, metadata, target);
  };
}
