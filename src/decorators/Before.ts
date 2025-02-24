import { HaveBeenApplied, HaveNotBeenApplied } from "@core/ensurances";
import symbols from "@core/constants";
import {
  ItemMiddlewareMetadata,
  MiddlewareMetadata,
} from "@core/metadata.types";
import { Token } from "@core/general.types";

export function Before(token: Token) {
  return function (
    target: any,
    propertyKey?: string | undefined,
    _propertyDescriptor?: PropertyDescriptor
  ) {
    const level = typeof propertyKey === "undefined" ? "class" : "method";
    const method = level == "class" ? undefined : propertyKey;
    const type = "Before";
    const targetDefinition = level == "class" ? target : target.prototype;
    HaveBeenApplied(targetDefinition, ["controller"]);
    HaveNotBeenApplied(targetDefinition, ["injectable", "module"]);
    let metadata: MiddlewareMetadata = Reflect.getMetadata(
      symbols.before,
      targetDefinition
    );
    const itemMetadata: ItemMiddlewareMetadata = { type, token, method };
    if (typeof metadata === "undefined") metadata = { middlewares: [] };
    metadata.middlewares.push(itemMetadata);
    Reflect.defineMetadata(symbols.before, metadata, targetDefinition);
  };
}
