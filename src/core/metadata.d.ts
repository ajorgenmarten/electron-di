import { ModuleOptions } from "./types";

export type InjectableMetadata = boolean
export type GlobalMetadata = boolean
export interface ControllerMetadata {
    prefix?: string;
    isInjectable: boolean;
}
export interface ModuleMetadata {
    options: ModuleOptions;
}
export interface IPCMetadata {
    ipcmethod: "send" | "invoke";
    path: string;
}
export interface InjectConstructorMetadata {
    tokens: Token[];
}
interface MethodArg {
    type: "body" | "headers" | "event" | "request";
}
export interface InjectMethodArg {
    args: MethodArg[];
}