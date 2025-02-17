import { HaveNotBeenApplied } from "@core/ensurances";
import { ControllerMetadata } from "@core/metadata";
import symbols from "@core/constants";

export function Controller(prefix?: string) {
  return function (target: any) {
    HaveNotBeenApplied(target, ["injectable", "module", "global"]);
    const metadata: ControllerMetadata = { prefix };
    Reflect.defineMetadata(symbols.controller, metadata, target);
  };
}
