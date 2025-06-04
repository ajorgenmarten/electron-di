import { Class, ControllerMetadata, HandlerMetadata, InjectableMetadata, GuardMetadata, ModuleMetadata, ParamMetadata, Provider, Token } from "../types";
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
    static getGuardsMetadata(cls: Class, property?: string): GuardMetadata[] {
        const metadata = Reflect.getMetadata(SYMBOLS.middleware, cls, property as string) || [] as GuardMetadata[];
        return metadata
    }
    static getHandlerMetadata(cls: Class, property: string): HandlerMetadata | undefined {
        const metadata = Reflect.getMetadata(SYMBOLS.handler, cls, property)
        return metadata
    }
    static getParamsMetadata(cls: Class, property: string): ParamMetadata {
        const metadata = Reflect.getMetadata(SYMBOLS.params, cls, property) as ParamMetadata || []
        return metadata
    }
    // METADATA SETTERS
    static setInjectableMetadata(metadata: InjectableMetadata, target: Class) {
        Reflect.defineMetadata(SYMBOLS.provider, metadata, target)
    }
    static setControllerMetadata(metadata: ControllerMetadata, target: Class) {
        Reflect.defineMetadata(SYMBOLS.controller, metadata, target)
    }
    static setGuardMetadata(metadata: GuardMetadata, target: Class, propertyKey?: string) {
        const middlewareMetadata = this.getGuardsMetadata(target, propertyKey)
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
    static setParamMetadata(metadata: ParamMetadata[0], target: Class, propertyKey: string, paramIndex: number) {
        const paramsMetadata = this.getParamsMetadata(target, propertyKey)
        paramsMetadata[paramIndex] = metadata
        Reflect.defineMetadata(SYMBOLS.params, paramsMetadata, target, propertyKey)
    }
}