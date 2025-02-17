import { Class } from "./types";
import symbols from "./constants";

export function Bootstrap(module: Class) {
  const metadata = Reflect.getMetadata(symbols.module, module);
  console.log(metadata);
}
