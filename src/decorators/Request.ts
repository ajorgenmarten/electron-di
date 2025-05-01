import { ParamsMetadata } from "@typedefs/metadata.types";
import symbols from "@core/constants";

/**
 * Decorador que permite inyectar el objeto Request en los parámetros de un método.
 *
 * @remarks
 * Este decorador se utiliza para marcar un parámetro que debe recibir el objeto Request
 * durante la ejecución del método.
 *
 * @example
 * ```typescript
 * |@Controller()
 * class MyController {
 *   |@OnInvoke('my-event')
 *   public someMethod(@Request() req: any) {
 *     // req contiene el objeto Request
 *   }
 * }
 * ```
 *
 * @returns Decorador de parámetro que configura la inyección del objeto Request
 */

export function Request() {
  return function (target: any, propertyKey: string, paramIndex: number) {
    const metadata: ParamsMetadata = Reflect.getMetadata(
      symbols.paramsArg,
      target,
      propertyKey
    ) ?? { params: [] };
    metadata.params[paramIndex] = { type: "Request" };
    Reflect.defineMetadata(symbols.paramsArg, metadata, target, propertyKey);
  };
}
