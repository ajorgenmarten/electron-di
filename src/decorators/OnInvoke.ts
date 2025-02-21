import symbols from "@core/constants";
import { IPCMethodMetadata, ItemIPCMethodMetadata } from "@core/metadata";

export function OnInvoke(channel: string) {
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
      type: "invoke",
      channel,
    };
    metadata.methods.push(metadataItem);
    Reflect.defineMetadata(symbols.onsend, metadata, target, propertyKey);
  };
}
