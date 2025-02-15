export interface Class {
    new (...args: any[]): any;
}

export interface AbstractClass {
    abstract new (...args: any[]): any;
}

export type Token = Class | AbstractClass;

export interface Provider {
    provided: Token;
    useClass: Class;
}

export interface ModuleOptions {
    imports?: Class[];
    providers?: (Class | Provider)[];
    controllers?: Class[];
    exports?: Class[];
}

type ClassDecorators = "Module" | "Global" | "Controller" | "Injectable"
type MethodDecorators = "OnInvoke" | "OnSend"
type ArgumentDecorators = "Inject" | "IPCEvent" | "Request" | "Body" | "Headers"
type BothDecorators = "Before" | "After"

export type Decorators = ClassDecorators | MethodDecorators | ArgumentDecorators | BothDecorators