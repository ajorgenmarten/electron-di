import { HaveBeenApplied, HaveNotBeenApplied } from "@core/ensurances";
import symbols from "@core/constants";
import {
  ItemMiddlewareMetadata,
  MiddlewareMetadata,
} from "@core/metadata.types";
import { Token } from "@core/general.types";

export function After(token: Token) {
  return function (
    target: any,
    propertyKey?: string | undefined,
    _propertyDescriptor?: PropertyDescriptor
  ) {
    const level = typeof propertyKey === "undefined" ? "class" : "method";
    const method = level == "class" ? undefined : propertyKey;
    const type = "After";
    const targetDefinition = level == "class" ? target : target.prototype;
    HaveBeenApplied(targetDefinition, ["controller"]);
    HaveNotBeenApplied(targetDefinition, ["injectable", "module"]);
    let metadata: MiddlewareMetadata = Reflect.getMetadata(
      symbols.after,
      targetDefinition
    );
    const itemMetadata: ItemMiddlewareMetadata = { type, token, method };
    if (typeof metadata === "undefined") metadata = { middlewares: [] };
    metadata.middlewares.push(itemMetadata);
    Reflect.defineMetadata(symbols.after, metadata, targetDefinition);
  };
}
