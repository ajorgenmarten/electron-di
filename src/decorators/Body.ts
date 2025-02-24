import { HaveBeenApplied, HaveNotBeenApplied } from "@core/ensurances";
import { ParamsMetadata } from "@core/metadata.types";
import symbols from "@core/constants";

export function Body(key?: string) {
  return function (target: any, propertyKey: string, paramIndex: number) {
    const targetDefinition = target.prototype;
    HaveNotBeenApplied(targetDefinition, ["injectable", "module"]);
    HaveBeenApplied(targetDefinition, ["controller"]);
    let metadata: ParamsMetadata = Reflect.getMetadata(
      symbols.body,
      target,
      propertyKey
    );
    if (typeof metadata === "undefined") metadata = { params: [] };
    metadata.params[paramIndex] = { type: "Body", key };
    Reflect.defineMetadata(symbols.body, metadata, target, propertyKey);
  };
}
