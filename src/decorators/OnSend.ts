import symbols from "@core/constants";
import { IPCMethodMetadata } from "@typedefs/metadata.types";

export function OnSend(channel: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const metadata: IPCMethodMetadata = {
      type: "send",
      channel,
    };
    Reflect.defineMetadata(symbols.ipcmethod, metadata, target, propertyKey);
  };
}
