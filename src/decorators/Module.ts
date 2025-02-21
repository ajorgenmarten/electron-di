import { HaveNotBeenApplied } from "@core/ensurances";
import symbols from "@core/constants";
import {
  InjectableMetadata,
  ModuleMetadata,
  ModuleOptions,
} from "@core/metadata";
import { Class } from "@core/types";

export function Module(options: ModuleOptions) {
  return function (target: Class) {
    HaveNotBeenApplied(target, ["controller", "injectable"]);
    const metadata: ModuleMetadata = { options };
    Reflect.defineMetadata(symbols.module, metadata, target);
  };
}
