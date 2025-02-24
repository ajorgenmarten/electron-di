import { InjectableMetadata } from "@core/metadata.types";
import symbols from "@core/constants";
import { Class } from "@core/general.types";
import { HaveNotBeenApplied } from "@core/ensurances";

export function Injectable() {
  return function (target: Class) {
    const metadata: InjectableMetadata = true;
    Reflect.defineMetadata(symbols.injectable, metadata, target);
  };
}
