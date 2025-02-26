import symbols from "@core/constants";
import { ModuleMetadata, ModuleOptions } from "@typedefs/metadata.types";
import { Class } from "@typedefs/general.types";

export function Module(options: ModuleOptions) {
  return function (target: Class) {
    const metadata: ModuleMetadata = { options };
    Reflect.defineMetadata(symbols.module, metadata, target);
  };
}
