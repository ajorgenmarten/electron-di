import { HaveNotBeenApplied } from "@core/ensurances";
import { ControllerMetadata } from "@core/metadata.types";
import symbols from "@core/constants";

export function Controller(prefix?: string) {
  return function (target: any) {
    const metadata: ControllerMetadata = { prefix };
    Reflect.defineMetadata(symbols.controller, metadata, target);
  };
}
