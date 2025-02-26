import {
  IComponent,
  IContainer,
  IController,
  ILinkObject,
  IMiddleware,
  IModule,
} from "@typedefs/container.types";
import {
  ControllerMetadata,
  GlobalMetadata,
  InjectableMetadata,
  InjectMetadata,
  IProvider,
  ItemMiddlewareMetadata,
  MiddlewareMetadata,
  ModuleMetadata,
} from "@typedefs/metadata.types";
import { Class, Token } from "@typedefs/general.types";
import symbols from "./constants";

abstract class Component implements IComponent {
  constructor(
    private _token: Token,
    private _useClass: Class
  ) {}

  get Token() {
    return this._token;
  }
  get UseClass() {
    return this._useClass;
  }
}

class Provider extends Component {
  constructor(provider: IProvider) {
    const [token, useClass] =
      typeof provider === "function"
        ? [provider, provider]
        : [provider.provide, provider.useClass];
    // VERIFICAR SI ESTA INYECTADA CON EL DECORADOR @Injectable
    const injectableMetadata: InjectableMetadata =
      Reflect.getMetadata(symbols.injectable, useClass) ?? false;
    if (!injectableMetadata)
      throw new Error(
        `La clase ${useClass.name} no ha sido decorada con @Injectable`
      );
    super(token, useClass);
  }
}

class Middleware implements IMiddleware {
  constructor(
    private token: Token,
    private type: ItemMiddlewareMetadata["type"]
  ) {}
  get Type() {
    return this.type;
  }
  get Token() {
    return this.token;
  }
}

class Controller extends Component implements IController {
  private _prefix: string;
  private _middlewares: Middleware[] = [];
  constructor(controllerClass: Class) {
    // VERIFICAR SI ESTA INYECTADA CON EL DECORADOR @Controller
    const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
      symbols.controller,
      controllerClass
    );
    if (typeof controllerMetadata === "undefined")
      throw new Error(
        `La clase ${controllerClass.name} no ha sido decorada con @Controller`
      );
    super(controllerClass, controllerClass);
    this._prefix = controllerMetadata.prefix ?? "";
    // OBTENER MIDDLEWARES DE LA CLASE
    const middlewareMetadata: MiddlewareMetadata = Reflect.getMetadata(
      symbols.middlewares,
      controllerClass
    ) ?? { middlewares: [] };
    for (const middlewareItem of middlewareMetadata.middlewares) {
      const middleware = new Middleware(
        middlewareItem.token,
        middlewareItem.type
      );
      this._middlewares.push(middleware);
    }
  }
  get Prefix() {
    return this._prefix;
  }
  get Middlewares() {
    return this._middlewares;
  }
}

class Module implements IModule {
  private _controllers: Controller[] = [];
  private _providers: Provider[] = [];
  private _imports: Class[] = [];
  private _exports: Token[] = [];
  private _instances: Map<Token, InstanceType<Token>> = new Map();
  private _isGlobal: boolean = false;
  private _linkObject: ILinkObject;
  private _Class: Class;
  constructor(moduleClass: Class, linkObject: ILinkObject) {
    // VERIFICAR SI ESTA INYECTADA CON EL DECORADOR @Module
    const moduleMetadata: ModuleMetadata = Reflect.getMetadata(
      symbols.module,
      moduleClass
    );
    if (typeof moduleMetadata === "undefined")
      throw new Error(
        `La clase ${moduleClass.name} no ha sido decorada con @Module`
      );
    // VERIFICAR SI LA CLASE ES GLOBAL
    const globalMetadata: GlobalMetadata = Reflect.getMetadata(
      symbols.global,
      moduleClass
    );
    this._isGlobal = typeof globalMetadata !== "undefined";
    const imports = moduleMetadata.options.imports ?? [];
    const providers = moduleMetadata.options.providers ?? [];
    const controllers = moduleMetadata.options.controllers ?? [];
    const exports = moduleMetadata.options.exports ?? [];
    for (const importModule of imports) {
      this._imports.push(importModule);
    }
    for (const provider of providers) {
      this._providers.push(new Provider(provider));
    }
    for (const controller of controllers) {
      this._controllers.push(new Controller(controller));
    }
    for (const exportToken of exports) {
      this._exports.push(exportToken);
    }
    this._Class = moduleClass;
    this._linkObject = linkObject;
  }
  get Controllers() {
    return this._controllers;
  }
  get Providers() {
    return this._providers;
  }
  get Imports() {
    return this._imports;
  }
  get Exports() {
    return this._exports;
  }
  get Instances() {
    return this._instances;
  }
  get IsGlobal() {
    return this._isGlobal;
  }
  get Class() {
    return this._Class;
  }
  resolve<T>(token: Token<T>): InstanceType<Token<T>> | null {
    // VERIFICAR SI YA EXISTE LA INSTANCIA
    const instance = this._instances.get(token);
    if (instance) return instance;
    // VERIFICAR SI EXISTE EL PROVEEDOR O EL CONTROLADOR
    const resolved =
      this._providers.find((provider) => provider.Token === token) ||
      this._controllers.find((controller) => controller.Token === token);
    if (resolved) {
      const ResolvedClass = resolved.UseClass;
      const { constructorArgs }: InjectMetadata = Reflect.getMetadata(
        symbols.inject,
        ResolvedClass
      ) || { constructorArgs: [] };
      const ResolvedDependencies = constructorArgs.map((dependency) =>
        this.resolve(dependency)
      );
      const resolvedInstance = new ResolvedClass(...ResolvedDependencies);
      this._instances.set(token, resolvedInstance);
      return resolvedInstance;
    } else {
      let instance = this._linkObject.findInGlobalModules(token);
      if (instance) return instance;
      instance = this._linkObject.findInSharedModules(token, this._imports);
      if (instance) return instance;
    }
    return null;
  }
}

export class Container implements IContainer {
  private _modules: Module[] = [];
  private _cache: Map<Token, Class[]> = new Map();

  /**
   * Esta función es para cachear los tokens que son tanto los proveedores como los controladores,
   * el cache funciona de la siguiente manera:
   * Se obtienen todos los tokens del modulo que son los proveedores y los controladores
   * Luego se registra cada token como identificador del cual el valor va a ser el o los modulos donde se encuentra el token
   * @param module Modulo del cual se va a cachear los tokens que son tanto los proveedores como los controladores
   */
  private cacheTokenPath(module: Module) {
    const getTokens = (components: Component[]) => {
      return components.map((component) => component.Token);
    };
    const tokens = [
      getTokens(module.Controllers),
      getTokens(module.Providers),
    ].flat();
    for (const token of tokens) {
      const cached = this._cache.get(token) ?? [];
      if (cached.includes(module.Class)) continue;
      cached.push(module.Class);
      this._cache.set(token, cached);
    }
  }
  private findInGlobalModules(token: Token) {
    // VERIFICAR SI EL MODULO AL QUE PERTENECE EL TOKEN ESTA CACHEADO
    const cached = this._cache.get(token);
    if (!cached) return null;
    const module = this._modules
      .filter((module) => cached.includes(module.Class))
      .shift();
    if (!module) return null;
    if (!module.IsGlobal) return null;
    return module.resolve(token);
  }
  private findInSharedModules(token: Token, modules: Class[]) {
    // VERIFICAR SI EL MODULO AL QUE PERTENECE EL TOKEN ESTA CACHEADO
    const cached = this._cache.get(token);
    if (!cached) return null;
    const filteredModule = cached
      .filter((moduleClass) => modules.includes(moduleClass))
      .map((moduleClass) => {
        return this._modules.find((module) => module.Class === moduleClass);
      })
      .filter((module) => module?.Exports.includes(token))
      .shift();
    if (!filteredModule) return null;
    return filteredModule.resolve(token);
  }
  registerModule(module: Class) {
    const exist = this._modules.find(
      (moduleItem) => moduleItem.Class === module
    );
    if (exist) return;
    const linkObject = {
      findInGlobalModules: this.findInGlobalModules.bind(this),
      findInSharedModules: this.findInSharedModules.bind(this),
    };
    const moduleClass = new Module(module, linkObject);
    for (const moduleImported of moduleClass.Imports) {
      this.registerModule(moduleImported);
    }
    this._modules.push(moduleClass);
    this.cacheTokenPath(moduleClass);
  }
  resolve(token: Token) {
    const exist = this._cache.get(token);
    if (!exist)
      throw new Error(
        `No se ha encontrado ninguna instancia para ${token.name}`
      );
    const module = this._modules.find(
      (module) => module.Class === exist[0]
    ) as Module;
    return module.resolve(token);
  }
  get Modules() {
    return this._modules;
  }
}
