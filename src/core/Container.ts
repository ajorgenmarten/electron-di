import { InjectableMetadata, Token, Class, Provider } from "./types";
import { MetadataHandler } from "./MetadataHandler";
import { Reflector } from "./Reflector";
import { Logger } from "./Logger";

type Injectable = {
    value: Class
    Context: Class
    Dependencies: Token[]
}

type ModuleInfo = {
    Imports: Set<Class>
    Providers: Set<Token>
    Exports: Set<Token>
}

type ProviderInfo = {
    Scope: InjectableMetadata['scope']
} & Injectable

type ControllerInfo = {
    Prefix: string
} & Injectable

type ResolveInfo = {
    reflectorContext?: { controller: Class, handler?: string }
}

export class Container {
    private logger: Logger =  Logger.Logger
    private modules: Map<Class, ModuleInfo> = new Map()
    private globals: Map<Class, ModuleInfo> = new Map()
    private providers: Map<Token, ProviderInfo> = new Map()
    private controllers: Map<Class, ControllerInfo> = new Map()
    private resolutinCache: Set<string> = new Set() 
    private instances: WeakMap<Token, any> = new WeakMap()

    constructor(importedModule: Class) {
        this.register(importedModule)
    }

    private register(importedModule: Class) {
        if (this.modules.has(importedModule) || this.globals.has(importedModule)) return

        const moduleMetadata = MetadataHandler.GetModuleMetadata(importedModule)
        if (!moduleMetadata) throw new Error(`Class "${importedModule.name}" is not a module`)

        const controllers = moduleMetadata.controllers || []
        const providers = moduleMetadata.providers || []
        const exports = moduleMetadata.exports || []
        const imports = moduleMetadata.imports || []

        const normalizedProviders = providers.map((provider) => this.normalizeProvider(provider) )
        const moduleInfo: ModuleInfo = { Exports: new Set(exports), Imports: new Set(imports), Providers: new Set(normalizedProviders.map(np => np.token)) }
        
        const globalMetadata = MetadataHandler.GetGlobalMetadata(importedModule)
        if (globalMetadata) this.globals.set(importedModule, moduleInfo)
        else this.modules.set(importedModule, moduleInfo)

        for(const cls of imports) this.register(cls)

        for(const provider of normalizedProviders) this.registerProvider(provider.cls, provider.token, importedModule)

        for(const controller of controllers) this.registerController(controller, importedModule)
    }

    private normalizeProvider(provider: Provider) {
        const [cls, token] = typeof provider === 'object' ? [provider.useClass, provider.provided] : [provider, provider]
        return { cls, token }
    }

    private registerProvider(cls: Class, token: Token, context: Class) {
        if (this.providers.has(token)) return

        const providerMetadata = MetadataHandler.GetInjectableMetadata(cls)
        if (!providerMetadata) throw new Error(`Class "${cls.name}" is not a provider`)
        
        const dependencies = MetadataHandler.GetParamTypes(cls) || []

        this.providers.set(token, { Context: context, Dependencies: dependencies, Scope: providerMetadata.scope, value: cls })
    }

    private registerController(controller: Class, context: Class) {
        if (this.controllers.has(controller)) return

        const controllerMetadata = MetadataHandler.GetControllerMetadata(controller)
        if (!controllerMetadata) throw new Error(`Class "${controller.name}" is not a controller`)

        const dependencies = MetadataHandler.GetParamTypes(controller) || []

        this.controllers.set(controller, { Context: context, Dependencies: dependencies, value: controller, Prefix: controllerMetadata.prefix })
    }

    private checkInModuleScope(token: Token, scope: Class): boolean {
        // Verificar en el módulo actual
        const moduleInfo = this.modules.get(scope);
        if (!moduleInfo) return false;
    
        // Verificar si el token es proveído directamente
        if (moduleInfo.Providers.has(token)) return true;
    
        // Verificar en módulos importados (recursivamente)
        for (const importedModule of moduleInfo.Imports) {
            const importedModuleInfo = this.modules.get(importedModule) || this.globals.get(importedModule);
            if (!importedModuleInfo) continue;
    
            // Si el módulo importado exporta el token, verificar si lo provee
            if (importedModuleInfo.Exports.has(token)) {
                // Verificar si el módulo importado lo provee directamente
                if (importedModuleInfo.Providers.has(token)) return true;
                
                // O si alguno de sus módulos importados lo provee
                if (this.checkInModuleScope(token, importedModule)) return true;
            }
        }
    
        return false;
    }

    private checkInGlobalScope(token: Token, scope: Class) {
        for(const [cls, info] of this.globals) {
            if (cls === scope && info.Providers.has(token)) return true

            if (!info.Exports.has(token)) continue
            
            const importedModules = Array.from(info.Imports)

            for (const importedModule of importedModules) {
                if (this.globals.has(importedModule)) continue

                const importedModuleInfo = this.modules.get(importedModule) as ModuleInfo

                if (!importedModuleInfo.Exports.has(token)) continue

                if (this.checkInModuleScope(token, importedModule)) return true
            }

        }

        return false
    }

    resolve(token: any, scope: Class, options: ResolveInfo): any {
        if (typeof token !== 'function') return undefined

        if (token === Reflector && options.reflectorContext) return new Reflector(options.reflectorContext.controller, options.reflectorContext.handler)

        const provider = this.providers.get(token)

        if (!provider) throw new Error(`Provider "${token.name}" has been not provided`)

        const cacheKey = `${token.name}_${scope.name}`

        if (!this.resolutinCache.has(cacheKey) && this.checkInGlobalScope(token, scope) && this.checkInModuleScope(token, scope)) {
            this.logger.warn(`Provider "${token.name}" cannot be resolved in module "${scope.name}"`)
            return undefined
        }

        const instance = this.instances.get(token)

        if (instance && provider.Scope === 'singleton') return instance

        const params = MetadataHandler.GetParamTypes(provider.value) || []

        const dependencies = params.map((param: Token) => this.resolve(param, scope, options))

        const newInstance = new provider.value(...dependencies)

        if (provider.Scope === 'singleton') this.instances.set(token, newInstance)

        return newInstance
    }

    get Instances() {
        return this.instances
    }

    get Globals() {
        return this.globals
    }

    get Modules() {
        return this.modules
    }

    get Providers() {
        return this.providers
    }

    get Controllers() {
        return this.controllers
    }
}