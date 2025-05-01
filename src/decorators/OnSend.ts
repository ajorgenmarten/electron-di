import symbols from "@core/constants";
import { IPCMethodMetadata } from "@typedefs/metadata.types";

/**
 * Decorador que permite escuchar eventos IPC enviados desde el proceso principal.
 *
 * @param channel - El nombre del canal IPC por el cual se enviará el mensaje
 * @returns Decorador de método que configura el handler para eventos IPC
 *
 * @example
 * |@Controller()
 * class MyClass {
 *   |@OnSend('my-channel')
 *   handleMessage(data: any) {
 *     // Manejar el mensaje recibido
 *   }
 * }
 */

export function OnSend(channel: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const metadata: IPCMethodMetadata = {
      type: "send",
      channel,
    };
    Reflect.defineMetadata(symbols.ipcmethod, metadata, target, propertyKey);
  };
}
