import { HaveBeenApplied, HaveNotBeenApplied } from "@core/ensurances";
import { ParamsMetadata } from "@core/metadata";
import symbols from "@core/constants";

export function Request(key?: string) {
  return function (target: any, propertyKey: string, paramIndex: number) {
    const targetDefinition = target.prototype;
    HaveNotBeenApplied(targetDefinition, ["injectable", "module"]);
    HaveBeenApplied(targetDefinition, ["controller"]);
    let metadata: ParamsMetadata = Reflect.getMetadata(
      symbols.request,
      target,
      propertyKey
    );
    if (typeof metadata === "undefined") metadata = { params: [] };
    metadata.params[paramIndex] = { type: "Request", key };
    Reflect.defineMetadata(symbols.request, metadata, target, propertyKey);
  };
}
