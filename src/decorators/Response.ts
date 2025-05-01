import symbols from "@core/constants";
import { ParamsMetadata } from "@typedefs/metadata.types";

/**
 * Decorador que permite inyectar el objeto Response en los parámetros del método.
 *
 * @remarks
 * Este decorador se utiliza para marcar un parámetro que debe recibir el objeto Response
 * en los métodos del controlador.
 *
 * @example
 * ```typescript
 * |@Controller()
 * class MyController {
 *   |@OnInvoke('my-event')
 *   public async handleRequest(@Response() response: any) {
 *     // El objeto response estará disponible aquí
 *   }
 * }
 * ```
 *
 * @returns Decorador de parámetro que configura la inyección del objeto Response
 */

export function Response() {
  return function (target: any, propertyKey: string, paramIndex: number) {
    const metadata: ParamsMetadata = Reflect.getMetadata(
      symbols.paramsArg,
      target,
      propertyKey
    ) ?? { params: [] };
    metadata.params[paramIndex] = { type: "Response" };
    Reflect.defineMetadata(symbols.paramsArg, metadata, target, propertyKey);
  };
}
