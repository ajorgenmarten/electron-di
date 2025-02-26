import symbols from "@core/constants";
import { GlobalMetadata } from "@typedefs/metadata.types";
import { Class } from "@typedefs/general.types";

export function Global() {
  return function (target: Class) {
    const metadata: GlobalMetadata = true;
    Reflect.defineMetadata(symbols.global, metadata, target);
  };
}
