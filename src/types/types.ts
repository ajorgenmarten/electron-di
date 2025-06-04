import { IpcMainEvent, IpcMainInvokeEvent } from "electron"

export type Class<T = any> = new (...args: any[]) => T

export type AbstractClass<T = any> = abstract new (...args: any[]) => T

export type Token<T = any> = Class<T> | AbstractClass<T>

export type Provider = {
    useClass: Class
    provided: Token
} | Class

export type ModuleMetadata = {
    providers?: Provider[]
    controllers?: Class[]
    exports?: Token[]
    imports?: Class[]
}

export type ControllerMetadata = {
    prefix: string
}

export type InjectableMetadata = {
    scope: "singleton" | "transient"
}

export type HandlerMetadata = {
    type: "invoke" | "send"
    channel: string
}

export type GuardMetadata = {
    type: "after" | "before"
    token: Token
}

export type ParamMetadata = ("event"|"payload"|"request")[]

export type ExecutionContext = {
    ipcEvent: IpcMainInvokeEvent | IpcMainEvent
    payload: any
}

export interface Guard {
    execute(...args: any[]): void | boolean | Promise<void | boolean>
}

export type InstanceOf<T extends new (...args: any[]) => any> = InstanceType<T>;

export type AppOptions = {
    logger: boolean
    overloadHandlers: boolean
}