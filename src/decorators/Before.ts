import symbols from "@core/constants";
import {
  ItemMiddlewareMetadata,
  MiddlewareMetadata,
} from "@typedefs/metadata.types";
import { Token } from "@typedefs/general.types";

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
