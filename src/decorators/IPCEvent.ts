import { ParamsMetadata } from "@typedefs/metadata.types";
import symbols from "@core/constants";
import { IpcMainEvent, IpcMainInvokeEvent } from "electron";

export function IPCEvent() {
  return function (target: any, propertyKey: string, paramIndex: number) {
    const metadata: ParamsMetadata = Reflect.getMetadata(
      symbols.paramsArg,
      target,
      propertyKey
    ) ?? { params: [] };
    metadata.params[paramIndex] = { type: "IpcEvent" };
    Reflect.defineMetadata(symbols.paramsArg, metadata, target, propertyKey);
  };
}
