import { CLASS_METADATA_KEY } from "./constants";
import { IAbstractClass, IClass, IModuleOptions, IProvider, IDecorateMetadata } from "./types";
import { ElectronDIError, Logger } from "./utils";

class ModuleContainer {
    private readonly instances: Map<string, any> = new Map();
    private readonly providers: Map<string, IClass> = new Map();

    /**
     * Registra una dependencia en el contenedor de módulos.
     * @param provider Clase o proveedor a registrar.
     */
    registerDependency(provider: IClass | IProvider) {
        // Obtener el identificador y la clase.
        const [useClass, token] = typeof provider === 'function'
            ? [provider, provider.name]
            : [provider.useClass, provider.provide.name];

        // Comprobar si ya se encuentra registrado.
        if (this.providers.has(token)) return;

        // Obtener la metadata de la clase.
        const metadata: IDecorateMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, useClass);
        
        // Verificar si tiene metadata.
        if (metadata === undefined) throw new ElectronDIError(`Decorate class "${useClass.name}" with @Injectable or @Controller`);

        // Verificar que sea decorada con @Injectable o @Controller.
        if (metadata.type === "module") throw new ElectronDIError(`Decorate class "${useClass.name}" with @Injectable or @Controller`);

        // Registrar el proveedor.
        this.providers.set(token, useClass);
    }

    /**
     * Resuelve una dependencia y devuelve una instancia de ella.
     * @param token Identificador o clase de la dependencia a resolver.
     * @returns Instancia de la dependencia.
     */
    resolveDependency(token: string | IAbstractClass | IClass) {
        // Obtener el identificador.
        const key = typeof token === "string" ? token : token.name;

        // Verificar si ya se encuentra una instancia.
        if (this.instances.has(key)) return this.instances.get(key);

        // Obtener el proveedor.
        const provider = this.providers.get(key);
        
        // Comprobar si el proveedor está registrado.
        if (provider === undefined) 
            throw new ElectronDIError(`Dependency for "${key}" not registered. Use @Injectable or @Controller`);

        // Obtener metadata del proveedor.
        const providerMetadata: IDecorateMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, provider);

        let instance = null;
        
        // Comprobar si la clase requiere dependencias.
        if (providerMetadata.dependencies === undefined) {
            instance = new provider();
            this.instances.set(key, instance);
            return instance;
        }

        const instances: any[] = providerMetadata.dependencies.map((value: IClass | IAbstractClass) => {
            return this.resolveDependency(value);
        });
        instance = new provider(...instances);
        this.instances.set(key, instance);
        return instance;
    }
}

class DependencyInjector {
    private readonly container: Map<string, ModuleContainer> = new Map();

    /**
     * Registra un módulo en el contenedor.
     * @param classModule Clase del módulo a registrar.
     */
    registerModule(classModule: IClass) {
        const token = classModule.name;
        if (this.container.has(token)) return;

        const moduleMetadata: IDecorateMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, classModule);

        // Verificar si tiene metadatos.
        if (moduleMetadata === undefined) throw new ElectronDIError(`Class "${classModule.name}" is not decorated with @Module()`);

        // Verificar si es un módulo.
        const decorateWith = moduleMetadata.type == 'module'
            ? "@Module"
            : moduleMetadata.type == 'controller'
            ? "@Controller"
            : "@Injectable";
        if (moduleMetadata.type !== "module") throw new ElectronDIError(`Class "${classModule.name}" is decorated with "${decorateWith}"`);

        // Crear contenedor de dependencias para el módulo.
        const moduleContainer = new ModuleContainer();

        // Registrar los providers y los controllers en el contenedor.
        moduleMetadata.options?.providers?.forEach(provider => {
            moduleContainer.registerDependency(provider);
        });
        moduleMetadata.options?.controllers?.forEach(controller => {
            moduleContainer.registerDependency(controller);
        });
        Logger(`Module "${classModule.name}" registered.`);
        this.container.set(token, moduleContainer);
    }

    /**
     * Resuelve una dependencia en un módulo específico.
     * @param classModule Clase del módulo.
     * @param token Identificador o clase de la dependencia a resolver.
     * @returns Instancia de la dependencia.
     */
    resolveDependency(classModule: IClass, token: string | IClass | IAbstractClass) {
        const moduleContainer = this.container.get(classModule.name);
        if (moduleContainer === undefined) throw new ElectronDIError(`Module "${classModule.name}" has not been provided.`);
        return moduleContainer.resolveDependency(token);
    }

    /**
     * Obtiene el contenedor de módulos.
     * @returns Contenedor de módulos.
     */
    get Container() {
        return this.container;
    }
}

export const container = new DependencyInjector();
