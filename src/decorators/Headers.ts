import { ParamsMetadata } from "@typedefs/metadata.types";
import symbols from "@core/constants";

/**
 * Decorador que permite inyectar los headers de la petición IPC en un parámetro del método.
 *
 * @example
 * ```typescript
 * |@Controller()
 * class MyController {
 *   |@OnInvoke('my-event')
 *   handleRequest(@Headers() headers: any) {
 *     // Los headers estarán disponibles aquí
 *   }
 * }
 * ```
 *
 * @returns Decorador de parámetro que marca el argumento para recibir los headers
 */

export function Headers() {
  return function (target: any, propertyKey: string, paramIndex: number) {
    const metadata: ParamsMetadata = Reflect.getMetadata(
      symbols.paramsArg,
      target,
      propertyKey
    ) ?? { params: [] };
    metadata.params[paramIndex] = { type: "Headers" };
    Reflect.defineMetadata(symbols.paramsArg, metadata, target, propertyKey);
  };
}
