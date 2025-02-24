import { Class, Token } from "./general.types";

export type IProvider = { provide: Token; useClass: Class } | Class;
export type ParamsDecorator =
  | "IpcEvent"
  | "Body"
  | "Headers"
  | "Request"
  | "Response";
export interface ItemParamMetadata {
  type: ParamsDecorator;
  key?: string;
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
export interface ItemIPCMethodMetadata {
  type: "send" | "invoke";
  channel: string;
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
  methods: ItemIPCMethodMetadata[];
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
