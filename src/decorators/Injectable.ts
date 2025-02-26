import { InjectableMetadata } from "@typedefs/metadata.types";
import symbols from "@core/constants";
import { Class } from "@typedefs/general.types";

export function Injectable() {
  return function (target: Class) {
    const metadata: InjectableMetadata = true;
    Reflect.defineMetadata(symbols.injectable, metadata, target);
  };
}
