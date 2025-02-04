import { CLASS_METADATA_KEY } from "./constants"
import { IAbstractClass, IClass, IModuleOptions, IProvider, IDecorateMetadata } from "./types"
import { ElectronDIError, Logger } from "./utils"

class ModuleContainer {
    private readonly instances: Map<string, any> = new Map()
    private readonly providers: Map<string, IClass> = new Map()

    registerDependency(provider: IClass | IProvider) {
        // OBTENER EL IDENTIFICADOR Y LA CLASE
        const [useClass, token] = typeof provider === 'function'
        ? [provider, provider.name]
        : [provider.useClass, provider.provide.name];

        // COMPROBAR SI YA SE ENCUENTRA REGISTRADO
        if (this.providers.has(token)) return

        // OBTENER LA METADATA DE LA CLASE
        const metadata: IDecorateMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, useClass)
        
        // VERIFICAR SI TIENE METADATA
        if (metadata === undefined) throw new ElectronDIError(`Decorate class "${useClass.name}" with @Injectable o @Controller`)

        // VERIFICAR QUE SEA DECORADA CON INJECTABLE O CONTROLLER
        if (metadata.type === "module") throw new ElectronDIError(`Decorate class "${useClass.name}" with @Injectable o @Controller`)

        // REGISTRAR EL PROVEEDOR
        this.providers.set(token, useClass)
    }

    resolveDependency(token: string | IAbstractClass | IClass) {
        // OBTENER EL IDENTIFICADOR
        const key = typeof token === "string" ? token : token.name

        // VERIFICAR SI YA SE ENCUENTRA UNA INSTANCIA
        if (this.instances.has(key)) return this.instances.get(key)

        // OBTENER EL PROVEEDOR
        const provider = this.providers.get(key);
        
        // COMPROBAR SI EL PROVEEDOR ESTA REGISTRADO
        if (provider === undefined) 
            throw new ElectronDIError(`Dependency for "${key}" not registered. Use @Injectable or @Controller`)

        // OBTENER METADATA DEL PROVEEDOR
        const providerMetadata: IDecorateMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, provider)

        let instance = null;
        
        // COMPROBAR SI LA CLASE REQUIERE DEPENDENCIAS
        if (providerMetadata.dependencies === undefined) {
            instance = new provider()
            this.instances.set(key, instance)
            return instance
        }

        const instances: any[] = providerMetadata.dependencies.map((value: IClass | IAbstractClass) => {
            return this.resolveDependency(value)
        })
        instance = new provider(...instances)
        this.instances.set(key, instance)
        return instance
    }
}
class DependencyInjector {
    private readonly container: Map<string, ModuleContainer> = new Map()

    registerModule(classModule: IClass) {
        const token = classModule.name;
        if (this.container.has(token)) return;

        const moduleMetadata: IDecorateMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, classModule)

        // VERIFICAR SI TIENE METADATOS
        if (moduleMetadata === undefined) throw new ElectronDIError(`Class "${classModule.name}" is not decorate with @Module()`)

        // VERIFICAR SI ES UN MODULO
        const decorateWith = moduleMetadata.type == 'module'
        ? "@Module"
        : moduleMetadata.type == 'controller'
        ? "@Controller"
        : "@Injectable"
        if (moduleMetadata.type !== "module") throw new ElectronDIError(`Class "${classModule.name}" is decorate with "${decorateWith}"`)

        // CREAR CONTENEDOR DE DEPENDECIAS PARA EL MODULO
        const moduleContainer = new ModuleContainer()

        // REGISTRER LOS PROVIDERS Y LOS CONTROLLERS EN EL CONTENEDOR
        moduleMetadata.options?.providers?.forEach(provider => {
            moduleContainer.registerDependency(provider)
        })
        moduleMetadata.options?.controllers?.forEach(controller => {
            moduleContainer.registerDependency(controller)
        })
        Logger(`Module "${classModule.name}" registered.`)
        this.container.set(token, moduleContainer)
    }

    resolveDependency(classModule: IClass, token: string | IClass | IAbstractClass) {
        const moduleContainer = this.container.get(classModule.name)
        if (moduleContainer === undefined) throw new ElectronDIError(`Module "${classModule.name}" has not provided.`)
        return moduleContainer.resolveDependency(token)
    }

    get Container() {
        return this.container
    }
}

export const container = new DependencyInjector()