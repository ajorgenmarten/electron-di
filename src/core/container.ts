import symbols from "./constants";
import { HaveBeenApplied } from "./ensurances";
import {
  ControllerMetadata,
  InjectMetadata,
  ModuleMetadata,
  ModuleOptions,
} from "./metadata";
import { Class, Token } from "./types";

type ResolveExternalProvider = (module: string, token: Token) => any;
type ResolveExternalProviderGlobal = (token: Token) => any;

class Module {
  private instances: Map<Token, Class> = new Map();
  constructor(
    private name: string,
    private options: ModuleOptions,
    private linkResolveForModule: ResolveExternalProvider,
    private linkResolveForGlobal: ResolveExternalProviderGlobal
  ) {}
  get Name() {
    return this.name;
  }
  get Controllers() {
    return this.options.controllers;
  }
  resolveGlobal(token: Token) {
    const instance = this.linkResolveForGlobal(token);
    return instance;
  }
  resolveExternal(token: Token) {
    if (typeof this.options.imports === "undefined") return null;
    for (const module of this.options.imports) {
      const instance = this.linkResolveForModule(module.name, token);
      if (!instance) continue;
      return instance;
    }
    return null;
  }
  resolve(token: Token) {
    if (this.instances.has(token)) return this.instances.get(token);
    if (typeof this.options.providers === "undefined") {
      let instance = this.resolveExternal(token);
      if (instance) return instance;
      instance = this.resolveGlobal(token);
      if (instance) return instance;
    } else
      for (const provider of this.options.providers) {
        const [provided, useClass] =
          typeof provider === "function"
            ? [provider, provider]
            : [provider.provide, provider.useClass];
        if (provided !== token) continue;
        const injectMetadata: InjectMetadata = Reflect.getMetadata(
          symbols.inject,
          useClass
        );
        let instance = null;
        if (typeof injectMetadata === "undefined") {
          instance = new useClass();
          this.instances.set(provided, instance);
        } else {
          const instances = injectMetadata.constructorArgs.map(
            (injectToken: Token) => {
              this.resolve(injectToken);
            }
          );
          instance = new useClass(...instances);
          this.instances.set(provided, instance);
        }
        return instance;
      }
    throw new Error(
      `No se ha encontrado el proveedor ${token.name} en el módulo ${this.name}`
    );
  }
}

export class Container {
  private modules: Map<string, Module> = new Map();
  private globalModules: string[] = [];

  registerTreeModule(module: Class) {
    HaveBeenApplied(module, ["module"]);
    const { options }: ModuleMetadata = Reflect.getMetadata(
      symbols.module,
      module
    );
    const name = module.name;
    const ModuleClass = new Module(
      name,
      options,
      this.resolve.bind(this),
      this.resolveGlobal.bind(this)
    );
    if (typeof options.imports !== "undefined") {
      for (const optionModule of options.imports) {
        this.registerTreeModule(optionModule);
      }
    }
    this.modules.set(name, ModuleClass);
    const isGlobal = Reflect.getMetadata(symbols.global, module);
    if (isGlobal === true) this.globalModules.push(name);
  }
  resolve(module: string, token: Token) {
    const ModuleClass = this.modules.get(module);
    if (!ModuleClass)
      throw new Error(`No se ha encontrado el módulo ${module}`);
    return ModuleClass.resolve(token);
  }
  resolveGlobal(token: Token) {
    for (const module of this.globalModules) {
      const ModuleClass = this.modules.get(module);
      const instance = ModuleClass?.resolve(token);
      if (instance) return instance;
    }
    return null;
  }
  upControllers() {
    for (const module of this.modules.values()) {
      if (typeof module.Controllers === "undefined") continue;
      console.log("module.Controllers: ", module);
      for (const controller of module.Controllers) {
        const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
          symbols.controller,
          controller
        );
        const injectMetadata: InjectMetadata = Reflect.getMetadata(
          symbols.inject,
          controller
        ) ?? { constructorArgs: [] };
        const argsInstances = injectMetadata.constructorArgs.map((token) =>
          module.resolve(token)
        );
        const controllerInstance = new controller(...argsInstances);
        console.log("\ncontrollerInstance: ", controllerInstance);
      }
    }
  }
}
