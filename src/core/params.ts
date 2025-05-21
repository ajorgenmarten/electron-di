import { IRequest } from "@typedefs/general.types";
import { IpcMainEvent, IpcMainInvokeEvent } from "electron";

/**
 * Esta clase representa un objeto con la informacion de la petición
 * que contiene el evento y el contenido de la petición en caso de
 * que tenga alguno.
 */
export class Request<Payload = any> implements IRequest<Payload> {
  constructor(
    private event: IpcMainInvokeEvent | IpcMainEvent,
    private payload?: Payload
  ) {}

  get Event() {
    return this.event;
  }

  get Payload(): Payload | undefined {
    return this.payload;
  }

  set Payload(value: Payload) {
    this.payload = value;
  }
}

export class Response<DataType = any> {
  private responseData?: DataType | undefined = undefined;

  send(payload: DataType | undefined) {
    this.responseData = payload;
  }

  get Data() {
    return typeof this.responseData === "undefined"
      ? undefined
      : JSON.parse(JSON.stringify(this.responseData));
  }
  set Data(data: DataType | undefined) {
    this.responseData = data;
  }
}
