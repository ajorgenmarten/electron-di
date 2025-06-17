import { Logger } from "./Logger";
import { MetadataHandler } from "./MetadataHandler";
import { Reflector } from "./Reflector";
import { Class, InjectableMetadata, Provider, Token } from "./types";

type InjectableInfo = {
    Context: Class
}

type ModuleInfo = {
    Imports: Set<Class>
    Providers: Map<Token, Class>
    Exports: Set<Token>
}

type ProviderInfo = {
    Scope: InjectableMetadata['scope']
    Class: Class
    IsExport: boolean
} & InjectableInfo

export type ControllerInfo = {
    Prefix: string
} & InjectableInfo

export class Container {
    private modules: Map<Class, ModuleInfo> = new Map()
    private globals: Set<Class> = new Set()
    private singletons: WeakMap<Token, any> = new WeakMap()
    private providers: Map<Token, ProviderInfo> = new Map()
    private controllers: Map<Class, ControllerInfo> = new Map()
    private logger = Logger.Logger

    constructor(module: Class) {
        this.registerModule(module)
    }

    private registerModule(module: Class) {
        const modulemetadata = MetadataHandler.GetModuleMetadata(module)
        if (typeof modulemetadata === 'undefined') throw new Error(`Class ${module.name} is not a @Module.`)

        const providers = (modulemetadata.providers ?? []).map(this.normalizeProvider)
        const controllers = new Set(modulemetadata.controllers ?? [])
        const imports = new Set(modulemetadata.imports ?? [])
        const exports = new Set(modulemetadata.exports ?? [])
        const globalmetadata = MetadataHandler.GetGlobalMetadata(module)

        this.registerProviders(providers, exports, module)
        this.regsiterControllers(controllers, module)

        const moduleInfo: ModuleInfo = {
            Imports: imports,
            Exports: exports,
            Providers: new Map(providers) 
        }
        this.modules.set(module, moduleInfo)
        globalmetadata === true && this.globals.add(module)
        imports.forEach(v => this.registerModule(v))
    }

    private normalizeProvider(provider: Provider): [Token, Class] {
        return typeof provider === 'object' ? [provider.provided, provider.useClass] : [provider, provider]
    }

    private regsiterControllers(controllers: Set<Class>, context: Class) {
        for(const controller of controllers) {
            const controllermetadata = MetadataHandler.GetControllerMetadata(controller)
            if (typeof controllermetadata === 'undefined') throw new Error(`Class ${controller.name} is not a @Controller`)
        
            const controllerInfo: ControllerInfo = {
                Context: context,
                Prefix: controllermetadata.prefix
            }

            this.controllers.set(controller, controllerInfo)
        }
    }

    private registerProviders(providers: [Token, Class][], exports: Set<Token>, context: Class) {
        for (const [Token, Class] of providers) {
            const providermetadata = MetadataHandler.GetInjectableMetadata(Class)
            if (typeof providermetadata === 'undefined') throw new Error(`Class ${Class.name} is not a @Injectable`)
            const providerinfo: ProviderInfo = {
                Class,
                IsExport: exports.has(Token),
                Scope: providermetadata.scope,
                Context: context
            }
            this.providers.set(Token, providerinfo)
        }
    }

    private checkInContext(token: Token, context: Class): boolean {
        const moduleinfo = this.modules.get(context) as ModuleInfo
        
        if (moduleinfo.Providers.has(token)) return true
        
        const importedmodules = moduleinfo.Imports

        for (const importedmodule of importedmodules) {
            if (this.globals.has(importedmodule)) continue

            const moduleinfo = this.modules.get(importedmodule) as ModuleInfo

            if(moduleinfo.Exports.has(token) && moduleinfo.Providers.has(token)) return true

            if(moduleinfo.Exports.has(token) && this.checkInContext(token, importedmodule)) return true
        }

        return false
    }

    private checkInGlobals(token: Token) {
        for(const globalmodule of this.globals) {
            const moduleinfo = this.modules.get(globalmodule) as ModuleInfo

            if (moduleinfo.Providers.has(token) && moduleinfo.Exports.has(token)) return true

            if (moduleinfo.Exports.has(token) && this.checkInContext(token, globalmodule)) return true

        }

        return false
    }

    resolve(token: Token, context: Class, controller?: Class, method?: string): any | undefined {
        if (token === Reflector) {
            return typeof controller !== 'undefined' ? new Reflector(controller, method) : undefined
        }

        const provider = this.providers.get(token)

        if (typeof provider === 'undefined') {
            this.logger.warn(`Dependency ${token.name} has been not provided`)
            return undefined
        }
        
        if (!this.checkInGlobals(token) && !this.checkInContext(token, context)) {
            this.logger.warn(`Provider "${token.name}" cannot be resolved in module "${context.name}"`)
            return undefined
        }

        if (provider.Scope === 'singleton' && this.singletons.has(token)) {
            return this.singletons.get(token)
        }

        const dependencies = MetadataHandler.GetParamTypes(provider.Class) ?? []

        const resolvedDependencies = dependencies.map(dependency => this.resolve(dependency, provider.Context, controller, method))

        const instance = new provider.Class(...resolvedDependencies)

        if (provider.Scope === 'singleton') this.singletons.set(token, instance)

        return instance
    }

    get Controllers() {
        return this.controllers
    }
}