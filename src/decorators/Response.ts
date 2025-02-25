import symbols from "@core/constants";
import { ParamsMetadata } from "@core/metadata.types";

export function Response() {
  return function (target: any, propertyKey: string, paramIndex: number) {
    const metadata: ParamsMetadata = Reflect.getMetadata(
      symbols.paramsArg,
      target,
      propertyKey
    ) ?? { params: [] };
    metadata.params[paramIndex] = { type: "Response" };
    Reflect.defineMetadata(symbols.paramsArg, metadata, target, propertyKey);
  };
}
