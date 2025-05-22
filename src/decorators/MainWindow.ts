import { ParamsMetadata } from "@typedefs/metadata.types";
import symbols from "@core/constants";

/**
 * Decorador que marca un parámetro como el objeto de la ventana principal..
 *
 * @remarks
 * Este decorador se utiliza para inyectar la ventana principal en los métodos de un controlador.
 *
 * @example
 * ```typescript
 * |@Controller()
 * class MyClass {
 *   |@OnInvoke('my-event')
 *   public myMethod(@MainWindow() window: BrowserWindow) {
 *     // Manejar el evento IPC
 *   }
 * }
 * ```
 *
 * @returns Un decorador de parámetro que registra los metadatos necesarios
 * para la inyección del evento IPC.
 */

export function MainWindow() {
  return function (target: any, propertyKey: string, paramIndex: number) {
    const metadata: ParamsMetadata = Reflect.getMetadata(
      symbols.paramsArg,
      target,
      propertyKey
    ) ?? { params: [] };
    metadata.params[paramIndex] = { type: "MainWindow" };
    Reflect.defineMetadata(symbols.paramsArg, metadata, target, propertyKey);
  };
}
