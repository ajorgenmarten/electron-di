import symbols from "@core/constants";
import { IPCMethodMetadata } from "@typedefs/metadata.types";

/**
 * Decorador que permite registrar un método como un manejador de eventos IPC (Inter-Process Communication)
 * utilizando el patrón invoke/handle.
 *
 * @param channel - Nombre del canal IPC por el cual se comunicarán los procesos
 * @returns Decorador de método que registra los metadatos necesarios para la comunicación IPC
 *
 * @example
 * |@Controller()
 * class Controller {
 *   |@OnInvoke('get-data')
 *   public async getData() {
 *     return { message: 'Hello from main process' };
 *   }
 * }
 */

export function OnInvoke(channel: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const metadata: IPCMethodMetadata = {
      type: "invoke",
      channel,
    };
    Reflect.defineMetadata(symbols.ipcmethod, metadata, target, propertyKey);
  };
}
