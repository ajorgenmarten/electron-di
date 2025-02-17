import { InjectableMetadata } from "@core/metadata";
import symbols from "@core/constants";
import { Class } from "@core/types";
import { HaveNotBeenApplied } from "@core/ensurances";

export function Injectable() {
  return function (target: Class) {
    HaveNotBeenApplied(target, ["controller", "module", "global"]);
    const metadata: InjectableMetadata = true;
    Reflect.defineMetadata(symbols.injectable, metadata, target);
  };
}
