import { ParamsMetadata } from "@typedefs/metadata.types";
import symbols from "@core/constants";

/**
 * Decorador que marca un parámetro como un evento IPC.
 *
 * @remarks
 * Este decorador se utiliza para inyectar eventos IPC en los métodos de una clase.
 * Los eventos IPC son utilizados para la comunicación entre procesos en Electron.
 *
 * @example
 * ```typescript
 * |@Controller()
 * class MyClass {
 *   |@OnInvoke('my-event')
 *   public myMethod(@IPCEvent() event: IpcMainEvent) {
 *     // Manejar el evento IPC
 *   }
 * }
 * ```
 *
 * @returns Un decorador de parámetro que registra los metadatos necesarios
 * para la inyección del evento IPC.
 */

export function IPCEvent() {
  return function (target: any, propertyKey: string, paramIndex: number) {
    const metadata: ParamsMetadata = Reflect.getMetadata(
      symbols.paramsArg,
      target,
      propertyKey
    ) ?? { params: [] };
    metadata.params[paramIndex] = { type: "IpcEvent" };
    Reflect.defineMetadata(symbols.paramsArg, metadata, target, propertyKey);
  };
}
