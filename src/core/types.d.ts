export type Class = new (...args: any[]) => any;
export type AbstractClass = abstract new (...args: any[]) => any;
export type Token = Class | AbstractClass
export type Provider = Class | {
    provided: Token
    useClass: Class
}

export type ModuleMetadata = {
    imports?: Class[]
    exports?: Token[]
    providers?: Provider[]
    controllers?: Class[]
}
export type GlobalMetadata = boolean
export type InjectableMetadata = {
    scope: 'transient' | 'singleton'
}
export type ControllerMetadata = {
    prefix: string
}
export type GuardMetadata = {
    type: 'after' | 'before'
    provider: Token
}
export type HandlerMetadata = {
    type: "invoke" | "send"
    channel: string
}
export type ParamMetadata = "event" | "payload" | "request"
export interface Guard {
    execute(...args: any[]): void | boolean | Promise<void | boolean>
}