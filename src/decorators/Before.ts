import symbols from "@core/constants";
import {
  ItemMiddlewareMetadata,
  MiddlewareMetadata,
} from "@typedefs/metadata.types";
import { Token } from "@typedefs/general.types";

/**
 * Decorador que permite ejecutar middleware antes de un método o clase
 *
 * @param token - Token que identifica el middleware a ejecutar
 * @example
 * // Uso a nivel de clase
 * |@Before(AuthMiddleware)
 * class UserController {
 *   // ...
 * }
 *
 * // Uso a nivel de método
 * class UserController {
 *   |@Before(LogMiddleware)
 *   |@OnInvoke('get-users')
 *   public async getUsers() {
 *     // ...
 *   }
 * }
 *
 * @remarks
 * Este decorador puede ser usado tanto a nivel de clase como a nivel de método.
 * Cuando se usa a nivel de clase, el middleware se ejecutará antes de todos los métodos.
 * Cuando se usa a nivel de método, el middleware se ejecutará solo antes de ese método específico.
 */

export function Before(token: Token) {
  return function (
    target: any,
    propertyKey?: string | undefined,
    _propertyDescriptor?: PropertyDescriptor
  ) {
    const level = typeof propertyKey === "undefined" ? "class" : "method";
    const method = level == "class" ? undefined : propertyKey;
    const type = "Before";
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
