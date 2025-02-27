import { ParamsMetadata } from "@typedefs/metadata.types";
import symbols from "@core/constants";

export function Payload() {
  return function (target: any, propertyKey: string, paramIndex: number) {
    const metadata: ParamsMetadata = Reflect.getMetadata(
      symbols.paramsArg,
      target,
      propertyKey
    ) ?? { params: [] };
    metadata.params[paramIndex] = { type: "Payload" };
    Reflect.defineMetadata(symbols.paramsArg, metadata, target, propertyKey);
  };
}
