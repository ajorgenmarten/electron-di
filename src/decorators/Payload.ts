import { ParamsMetadata } from "@typedefs/metadata.types";
import symbols from "@core/constants";

/**
 * Decorador que permite inyectar el payload de un evento IPC como parámetro en un método.
 *
 * @remarks
 * Este decorador se utiliza para marcar un parámetro de un método que debe recibir
 * el payload enviado desde el proceso principal o renderer de Electron.
 *
 * @example
 * ```typescript
 * |@Controller()
 * class MyService {
 *   |@OnInvoke('my-event')
 *   handleEvent(@Payload() data: any) {
 *     console.log(data); // Payload del evento IPC
 *   }
 * }
 * ```
 */
export function Payload() {
  return function (target: any, propertyKey: string, paramIndex: number) {
    const metadata: ParamsMetadata = Reflect.getMetadata(
      symbols.paramsArg,
      target,
      propertyKey
    ) ?? { params: [] };
    metadata.params[paramIndex] = { type: "Payload" };
    Reflect.defineMetadata(symbols.paramsArg, metadata, target, propertyKey);
  };
}
