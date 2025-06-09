import { Class, ControllerMetadata, GlobalMetadata, HandlerMetadata, GuardMetadata, InjectableMetadata, ModuleMetadata, ParamMetadata } from "./types"

const SYMBOLS = {
    global: Symbol('electron:global'),
    module: Symbol('electron:module'),
    controller: Symbol('electron:controller'),
    injectable: Symbol('electron:injectable'),
    guard: Symbol('electron:guard'),
    handler: Symbol('electron:handler'),
    params: Symbol('electron:params')
}

type DecorationTarget = {
    cls: Class,
    method?: string
}

export class MetadataHandler {
    static define(key: symbol | string, metadata: any, target: DecorationTarget) {
        if (!target.method)
            Reflect.defineMetadata(key, metadata, target.cls)
        else
            Reflect.defineMetadata(key, metadata, target.cls, target.method)
    }
    static get(key: symbol | string, target: DecorationTarget) {
        if (!target.method)
            return Reflect.getMetadata(key, target.cls)
        else
            return Reflect.getMetadata(key, target.cls, target.method)
    }
    static GetParamTypes(cls: Class, method?: string): any[] | undefined {
        return this.get('design:paramtypes', { cls, method })
    }

    // HANDLE MODULE METADATA
    static GetModuleMetadata(cls: Class): ModuleMetadata | undefined {
        return this.get(SYMBOLS.module, { cls })
    }
    static SetModuleMetadata(cls: Class, metadata: ModuleMetadata) {
        this.define(SYMBOLS.module, metadata, { cls })
    }
    // HANDLE GLOBAL METADATA
    static GetGlobalMetadata(cls: Class): GlobalMetadata | undefined {
        return this.get(SYMBOLS.global, { cls })
    }
    static SetGlobalMetadata(cls: Class, metadata: GlobalMetadata) {
        this.define(SYMBOLS.global, metadata, { cls })
    }
    // HANDLE INJECTABLE METADATA
    static GetInjectableMetadata(cls: Class): InjectableMetadata | undefined {
        return this.get(SYMBOLS.injectable, { cls })
    }
    static SetInjectableMetadata(cls: Class, metadata?: InjectableMetadata) {
        const injectableMetadata = { scope: 'singleton', ...metadata }
        this.define(SYMBOLS.injectable, injectableMetadata, { cls })
    }
    // HANDLE CONTROLLER METADATA
    static GetControllerMetadata(cls: Class): ControllerMetadata | undefined {
        return this.get(SYMBOLS.controller, { cls })
    }
    static SetControllerMetadata(cls: Class, metadata?: ControllerMetadata) {
        this.define(SYMBOLS.controller, metadata, { cls })
    }
    // HANDLE HANDLERS METADATA
    static GetHandlerMetadata(cls: Class, method: string): HandlerMetadata | undefined {
        return this.get(SYMBOLS.handler, { cls, method })
    }
    static SetHandlerMetadata(cls: Class, method: string, metadata: HandlerMetadata) {
        this.define(SYMBOLS.handler, metadata, { cls, method})
    }
    // HANDLE GUARDS METADATA
    static GetGuardMetadata(cls: Class, method?: string): GuardMetadata[] | undefined {
        return this.get(SYMBOLS.guard, { cls, method })
    }
    static SetGuardMetadata(cls: Class, metadata: GuardMetadata, method?: string) {
        const guardMetadata = this.GetGuardMetadata(cls, method) || []
        guardMetadata.push(metadata)
        this.define(SYMBOLS.guard, guardMetadata, { cls, method })
    }
    // HANDLE PARAMS METADATA
    static GetParamsMetadata(cls: Class, method: string): ParamMetadata[] | undefined {
        return this.get(SYMBOLS.params, { cls, method })
    }
    static SetParamsMetadata(cls: Class, method: string, index: number, metadata: ParamMetadata) {
        const paramsMetadata = this.GetParamsMetadata(cls, method) || []
        paramsMetadata[index] = metadata
        this.define(SYMBOLS.params, paramsMetadata, { cls, method })
    }
}