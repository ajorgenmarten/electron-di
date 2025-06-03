import { Class, ControllerMetadata, HandlerMetadata, InjectableMetadata, MiddlewareMetadata, ModuleMetadata, Provider, Token } from "../types";
import { SYMBOLS } from "./Symbols";

export default class ReflectionHandler {
    static getParamTypes(cls: Class): Token[] {
        const params = Reflect.getMetadata("design:paramtypes", cls) || [];
        return params;
    }
    static getGlobalMetadata(cls: Class): boolean {
        const metadata: boolean = Reflect.getMetadata(SYMBOLS.global, cls) || false;
        return metadata
    }
    static getModuleMetadata(cls: Class): ModuleMetadata | undefined {
        const metadata: ModuleMetadata = Reflect.getMetadata(SYMBOLS.module, cls);
        return metadata;
    }
    static getControllerMetadata(cls: Class): ControllerMetadata | undefined {
        const metadata: ControllerMetadata = Reflect.getMetadata(SYMBOLS.controller, cls);
        return metadata;
    }
    static getInjectableMetadata(cls: Class): InjectableMetadata | undefined {
        const metadata: InjectableMetadata = Reflect.getMetadata(SYMBOLS.provider, cls)
        return metadata;
    }
    static getMiddlewareMetadata(cls: Class, property?: string): MiddlewareMetadata[] {
        const metadata = Reflect.getMetadata(SYMBOLS.middleware, cls, property as string) || [] as MiddlewareMetadata[];
        return metadata
    }
    static getProviderMetadata(provider: Provider) {
        const cls = typeof provider === 'object' ? provider.useClass : provider;
        const metadata: boolean = Reflect.getMetadata(SYMBOLS.provider, cls)
        return metadata;
    }
    // METADATA SETTERS
    static setInjectableMetadata(metadata: InjectableMetadata, target: Class) {
        Reflect.defineMetadata(SYMBOLS.provider, metadata, target)
    }
    static setControllerMetadata(metadata: ControllerMetadata, target: Class) {
        Reflect.defineMetadata(SYMBOLS.controller, metadata, target)
    }
    static setMiddlewareMetadata(metadata: MiddlewareMetadata, target: Class, propertyKey?: string) {
        const middlewareMetadata = this.getMiddlewareMetadata(target, propertyKey)
        middlewareMetadata.push(metadata)
        Reflect.defineMetadata(SYMBOLS.middleware, middlewareMetadata, target, propertyKey as string)
    }
    static setHandlerMetadata(metadata: HandlerMetadata, target: Class, propertyKey: string) {
        Reflect.defineMetadata(SYMBOLS.handler, metadata, target, propertyKey as string)
    }
    static setModuleMetadata(metadata: ModuleMetadata, target: Class) {
        Reflect.defineMetadata(SYMBOLS.module, metadata, target)
    }
    static setGlobalMetadata(metadata: boolean, target: Class) {
        Reflect.defineMetadata(SYMBOLS.global, metadata, target)
    }
}