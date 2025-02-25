import symbols from "@core/constants";
import { ModuleMetadata, ModuleOptions } from "@core/metadata.types";
import { Class } from "@core/general.types";

export function Module(options: ModuleOptions) {
  return function (target: Class) {
    const metadata: ModuleMetadata = { options };
    Reflect.defineMetadata(symbols.module, metadata, target);
  };
}
