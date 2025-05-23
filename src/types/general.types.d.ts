import { Request, Response } from "@core/params";
import { BrowserWindow } from "electron";

export type Class<T = any> = new (...args: any[]) => T;

export type AbstractClass<T = any> = abstract new (...args: any[]) => T;

export type Token<T = any> = Class<T> | AbstractClass<T>;

type MiddlewareReturnType<T = "Before" | "After"> = T extends "After"
  ? Promise<void> | void
  : Promise<boolean> | boolean;

export type MiddlewareFunction<T> = (args: any[]) => MiddlewareReturnType<T>;

export type IMiddleware<T = "Before" | "After"> = {
  execute(...args: any[]): MiddlewareReturnType<T>;
};

export interface IRequest<PayloadDataType = any> {
  Event: IpcMainInvokeEvent | IpcMainEvent;
  Payload?: PayloadDataType | undefined;
}

interface IMiddlewareContext {
  request: Request;
  response: Response;
  mainWindow?: BrowserWindow;
}

export interface IIPCErrorConstructorParam {
  message: string;
  details?: any;
}
