import { HaveBeenApplied, HaveNotBeenApplied } from "@core/ensurances";
import { ParamsMetadata } from "@core/metadata.types";
import symbols from "@core/constants";

export function Headers(key?: string) {
  return function (target: any, propertyKey: string, paramIndex: number) {
    const targetDefinition = target.prototype;
    HaveNotBeenApplied(targetDefinition, ["injectable", "module"]);
    HaveBeenApplied(targetDefinition, ["controller"]);
    let metadata: ParamsMetadata = Reflect.getMetadata(
      symbols.headers,
      target,
      propertyKey
    );
    console.log(metadata);
    if (typeof metadata === "undefined") metadata = { params: [] };
    metadata.params[paramIndex] = { type: "Headers", key };
    Reflect.defineMetadata(symbols.headers, metadata, target, propertyKey);
  };
}
