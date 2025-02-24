import symbols from "@core/constants";
import { IPCMethodMetadata, ItemIPCMethodMetadata } from "@core/metadata.types";

export function OnSend(channel: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const metadata: IPCMethodMetadata = Reflect.getMetadata(
      symbols.onsend,
      target,
      propertyKey
    ) ?? { methods: [] };
    const metadataItem: ItemIPCMethodMetadata = {
      type: "send",
      channel,
    };
    metadata.methods.push(metadataItem);
    Reflect.defineMetadata(symbols.onsend, metadata, target, propertyKey);
  };
}
