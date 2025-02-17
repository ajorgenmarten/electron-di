import symbols from "@core/constants";
import { HaveBeenApplied, HaveNotBeenApplied } from "@core/ensurances";
import { GlobalMetadata } from "@core/metadata";
import { Class } from "@core/types";

export function Global() {
  return function (target: Class) {
    HaveNotBeenApplied(target, ["injectable", "controller"]);
    HaveBeenApplied(target, ["module"]);
    const metadata: GlobalMetadata = true;
    Reflect.defineMetadata(symbols.global, metadata, target);
  };
}
