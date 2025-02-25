import { ParamsMetadata } from "@core/metadata.types";
import symbols from "@core/constants";
import { IpcMainEvent, IpcMainInvokeEvent } from "electron";

export function IPCEvent(key?: keyof (IpcMainInvokeEvent & IpcMainEvent)) {
  return function (target: any, propertyKey: string, paramIndex: number) {
    const metadata: ParamsMetadata = Reflect.getMetadata(
      symbols.paramsArg,
      target,
      propertyKey
    ) ?? { params: [] };
    metadata.params[paramIndex] = { type: "IpcEvent", key };
    Reflect.defineMetadata(symbols.paramsArg, metadata, target, propertyKey);
  };
}
