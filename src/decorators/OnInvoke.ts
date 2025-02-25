import symbols from "@core/constants";
import { IPCMethodMetadata } from "@core/metadata.types";

export function OnInvoke(channel: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const metadata: IPCMethodMetadata = {
      type: "invoke",
      channel,
    };
    Reflect.defineMetadata(symbols.ipcmethod, metadata, target, propertyKey);
  };
}
