import symbols from "@core/constants";
import { GlobalMetadata } from "@core/metadata.types";
import { Class } from "@core/general.types";

export function Global() {
  return function (target: Class) {
    const metadata: GlobalMetadata = true;
    Reflect.defineMetadata(symbols.global, metadata, target);
  };
}
