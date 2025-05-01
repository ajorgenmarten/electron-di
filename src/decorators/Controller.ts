import { ControllerMetadata } from "@typedefs/metadata.types";
import symbols from "@core/constants";

/**
 * Función decoradora para Controladores
 * Marca una clase como controlador y permite establecer un prefijo de ruta
 *
 * @param prefix - Prefijo URL opcional para todas las rutas en este controlador
 * @returns Función decoradora que agrega metadatos de controlador a la clase objetivo
 * @example
 * ```ts
 * |@Controller('users')
 * class UserController {
 *   // Métodos del controlador
 * }
 * ```
 */

export function Controller(prefix?: string) {
  return function (target: any) {
    const metadata: ControllerMetadata = { prefix };
    Reflect.defineMetadata(symbols.controller, metadata, target);
  };
}
