import symbols from "@core/constants";
import {
  ItemMiddlewareMetadata,
  MiddlewareMetadata,
} from "@typedefs/metadata.types";
import { Token } from "@typedefs/general.types";

/**
 * Decorador que registra un middleware "After" para ser ejecutado después de un método o clase.
 *
 * @param token - El token de inyección de dependencias que identifica el middleware a ejecutar
 *
 * @example
 * // Middleware a nivel de clase
 * |@After(LoggerMiddleware)
 * class UserController {
 *   // ...
 * }
 *
 * @example
 * // Middleware a nivel de método
 * class UserController {
 *   |@After(ValidationMiddleware)
 *   |@OnInvoke('create-user')
 *   public async createUser() {
 *     // ...
 *   }
 * }
 *
 * El middleware se ejecutará en el siguiente orden:
 * 1. Ejecución original del método/clase
 * 2. Middleware After
 */

export function After(token: Token) {
  return function (
    target: any,
    propertyKey?: string | undefined,
    _propertyDescriptor?: PropertyDescriptor
  ) {
    const level = typeof propertyKey === "undefined" ? "class" : "method";
    const method = level == "class" ? undefined : propertyKey;
    const type = "After";
    let metadata: MiddlewareMetadata;
    if (level === "class") {
      metadata = Reflect.getMetadata(symbols.middlewares, target) ?? {
        middlewares: [],
      };
    } else {
      metadata = Reflect.getMetadata(
        symbols.middlewares,
        target,
        propertyKey as string
      ) ?? { middlewares: [] };
    }
    const itemMetadata: ItemMiddlewareMetadata = { type, token, method };
    metadata.middlewares.push(itemMetadata);
    if (level === "class") {
      Reflect.defineMetadata(symbols.middlewares, metadata, target);
    } else {
      Reflect.defineMetadata(
        symbols.middlewares,
        metadata,
        target,
        propertyKey as string
      );
    }
  };
}
