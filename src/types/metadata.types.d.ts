import { Class, Token } from "./general.types";

export type IProvider = { provide: Token; useClass: Class } | Class;
export type ParamsDecorator =
  | "IpcEvent"
  | "Payload"
  | "Headers"
  | "Request"
  | "MainWindow"
  | "Response";
export interface ItemParamMetadata {
  type: ParamsDecorator;
}

export interface ModuleOptions {
  providers?: IProvider[];
  controllers?: Class[];
  imports?: Class[];
  exports?: Token[];
}
export interface ItemMiddlewareMetadata {
  type: "After" | "Before";
  method?: string;
  token: Token;
}

export type InjectableMetadata = boolean;
export type GlobalMetadata = boolean;
export interface ControllerMetadata {
  prefix?: string;
}
export interface ModuleMetadata {
  options: ModuleOptions;
}
export interface IPCMethodMetadata {
  type: "send" | "invoke";
  channel: string;
}
export interface InjectMetadata {
  constructorArgs: Token[];
}
export interface ParamsMetadata {
  params: ItemParamMetadata[];
}
export interface MiddlewareMetadata {
  middlewares: ItemMiddlewareMetadata[];
}
