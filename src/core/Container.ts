import { Class, InjectableMetadata, Provider, Token } from "../types"
import ReflectionHandler from "./ReflectionHandler";

type ProviderRegister = {
    ScopeModule: Class
    Value: Class
    Options: InjectableMetadata
}

type ModuleRegister = {
    Providers: Set<Token>
    Imports: Set<Class>
    Exports: Set<Token>
}

export class DependencyContainer {
    private globals: Map<Class, ModuleRegister> = new Map();
    private modules: Map<Class, ModuleRegister> = new Map();
    private providers: Map<Token, ProviderRegister> = new Map();
    private instances: Map<Token, Class> = new Map();

    constructor(module: Class) {
        this.register(module)
    }

    private register(module: Class) {
        if (this.modules.has(module) || this.globals.has(module)) return

        const module_metadata = ReflectionHandler.getModuleMetadata(module)
        if (!module_metadata) throw new Error(`Class "${module.name}" is not a module`)

        const module_global: boolean = ReflectionHandler.getGlobalMetadata(module)
        const module_registered_data = { 
            Exports: new Set( module_metadata.exports || [] ),
            Imports: new Set( module_metadata.imports || [] ),
            Providers: new Set( module_metadata.providers?.map(p => typeof p === 'object' ? p.provided : p) || [] )
        }
        if (module_global) this.globals.set(module, module_registered_data)
        else this.modules.set( module, module_registered_data)

        module_metadata.imports?.forEach(sub_module => { this.register(sub_module) })
        
        module_metadata.providers?.forEach(provider => { this.register_provider(provider, module) })

    }

    private register_provider(provider: Provider, scope_module: Class) {
        const [token, cls] = typeof provider === 'object' ? [provider.provided, provider.useClass] : [provider, provider]
        
        if (this.providers.has(token)) return

        const options = ReflectionHandler.getInjectableMetadata(cls)
        if (!options) throw new Error(`Class "${cls.name}" is not injectable`)

        this.providers.set(token, { Options: options, Value: cls, ScopeModule: scope_module })
    }

    private check_scope_access(token: Token, root: Class, scope: Class) {
        if (root === scope && this.modules.get(root)?.Providers.has(token)) return true
        
        const modules = this.modules.get(root)?.Imports

        if (!modules) return false

        for( const module of modules) {
            if (this.globals.has(module)) continue;

            const module_registered = this.modules.get(module) as ModuleRegister

            const [in_providers, in_exports] = [
                module_registered.Providers.has(token),
                module_registered.Exports.has(token)
            ]
            
            if (in_providers && in_exports) return true

            if (in_exports && this.check_scope_access(token, root, module)) return true 
        }

        return false
    }
    
    private check_global_access(token: Token) {
        const global_modules = Array.from(this.globals)

        for (const [module, module_info] of global_modules) {
            const [in_providers, in_exports] = [
                module_info.Providers.has(token),
                module_info.Exports.has(token)
            ]

            if (in_providers && in_exports) return true

            if (in_exports) {
                
                const modules = Array.from(module_info.Imports)

                for (const import_module of modules) {
                    if (this.globals.has(import_module)) continue;

                    const module_registered = this.modules.get(import_module) as ModuleRegister

                    if (module_registered.Exports.has(token) && this.check_scope_access(token, module, import_module)) return true

                }

            }

        }

        return false
    }

    /**
    // CONDICIONES PARA RESOLVER UN PROVEEDOR
    // 1. Debe estar definido en los proveedores de esta clase
    // 2. Debe estar registrado y exportado en un modulo global
    // 3. Debe estar registrado y exportdao en un modulo importado
    */
    resolve<T>(token: Token<T>, scope: Class): Class<T> {
        const provider = this.providers.get(token)
        if (!provider) throw new Error(`Class "${token.name}" has been not provided`)

        if (!this.check_global_access(token) && !this.check_scope_access(token, scope, scope))
            throw new Error(`Class "${token.name}" can not injected in this scope`)

        if (provider.Options.scope === "singleton" && this.instances.has(token)) {
            return this.instances.get(token) as Class<T>
        }

        const injections = ReflectionHandler.getParamTypes(provider.Value)
        const dependencies = injections.map(depToken => this.resolve(depToken, provider.ScopeModule))

        const instance = new provider.Value(...dependencies)

        if (provider.Options.scope === "singleton") {
            this.instances.set(token, instance)
        }

        return instance
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
}