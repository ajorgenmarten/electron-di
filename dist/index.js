"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Bootstrap: () => Bootstrap,
  Controller: () => Controller,
  Inject: () => Inject,
  Injectable: () => Injectable,
  Module: () => Module,
  OnInvoke: () => OnInvoke,
  OnSend: () => OnSend,
  container: () => container
});
module.exports = __toCommonJS(index_exports);
var import_reflect_metadata = require("reflect-metadata");

// src/constants.ts
var CLASS_METADATA_KEY = Symbol("electron:classmetadata");

// src/utils.ts
function Logger(message, title) {
  console.log(`[${title || "ELECTRON DI"}]: 	 ${message}`);
}
var ElectronDIError = class extends Error {
  constructor(message) {
    super(`[ELECTRON DI]: 	 ${message}`);
  }
};

// src/container.ts
var ModuleContainer = class {
  constructor() {
    this.instances = /* @__PURE__ */ new Map();
    this.providers = /* @__PURE__ */ new Map();
  }
  /**
   * Registra una dependencia en el contenedor de módulos.
   * @param provider Clase o proveedor a registrar.
   */
  registerDependency(provider) {
    const [useClass, token] = typeof provider === "function" ? [provider, provider.name] : [provider.useClass, provider.provide.name];
    if (this.providers.has(token)) return;
    const metadata = Reflect.getMetadata(CLASS_METADATA_KEY, useClass);
    if (metadata === void 0) throw new ElectronDIError(`Decorate class "${useClass.name}" with @Injectable or @Controller`);
    if (metadata.type === "module") throw new ElectronDIError(`Decorate class "${useClass.name}" with @Injectable or @Controller`);
    this.providers.set(token, useClass);
  }
  /**
   * Resuelve una dependencia y devuelve una instancia de ella.
   * @param token Identificador o clase de la dependencia a resolver.
   * @returns Instancia de la dependencia.
   */
  resolveDependency(token) {
    const key = typeof token === "string" ? token : token.name;
    if (this.instances.has(key)) return this.instances.get(key);
    const provider = this.providers.get(key);
    if (provider === void 0)
      throw new ElectronDIError(`Dependency for "${key}" not registered. Use @Injectable or @Controller`);
    const providerMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, provider);
    let instance = null;
    if (providerMetadata.dependencies === void 0) {
      instance = new provider();
      this.instances.set(key, instance);
      return instance;
    }
    const instances = providerMetadata.dependencies.map((value) => {
      return this.resolveDependency(value);
    });
    instance = new provider(...instances);
    this.instances.set(key, instance);
    return instance;
  }
};
var DependencyInjector = class {
  constructor() {
    this.container = /* @__PURE__ */ new Map();
  }
  /**
   * Registra un módulo en el contenedor.
   * @param classModule Clase del módulo a registrar.
   */
  registerModule(classModule) {
    var _a, _b, _c, _d;
    const token = classModule.name;
    if (this.container.has(token)) return;
    const moduleMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, classModule);
    if (moduleMetadata === void 0) throw new ElectronDIError(`Class "${classModule.name}" is not decorated with @Module()`);
    const decorateWith = moduleMetadata.type == "module" ? "@Module" : moduleMetadata.type == "controller" ? "@Controller" : "@Injectable";
    if (moduleMetadata.type !== "module") throw new ElectronDIError(`Class "${classModule.name}" is decorated with "${decorateWith}"`);
    const moduleContainer = new ModuleContainer();
    (_b = (_a = moduleMetadata.options) == null ? void 0 : _a.providers) == null ? void 0 : _b.forEach((provider) => {
      moduleContainer.registerDependency(provider);
    });
    (_d = (_c = moduleMetadata.options) == null ? void 0 : _c.controllers) == null ? void 0 : _d.forEach((controller) => {
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
  resolveDependency(classModule, token) {
    const moduleContainer = this.container.get(classModule.name);
    if (moduleContainer === void 0) throw new ElectronDIError(`Module "${classModule.name}" has not been provided.`);
    return moduleContainer.resolveDependency(token);
  }
  /**
   * Obtiene el contenedor de módulos.
   * @returns Contenedor de módulos.
   */
  get Container() {
    return this.container;
  }
};
var container = new DependencyInjector();

// src/decorators.ts
function Inject(token) {
  return function(target, _propertyKey, paramIndex) {
    let metadata = Reflect.getMetadata(CLASS_METADATA_KEY, target);
    if (metadata === void 0) {
      metadata = { dependencies: [], type: "provider" };
    }
    if (!Array.isArray(metadata.dependencies)) {
      metadata.dependencies = [];
    }
    metadata.dependencies[paramIndex] = token;
    Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target);
  };
}
function Injectable() {
  return function(target) {
    const setMetadata = { type: "provider" };
    let metadata = Reflect.getMetadata(CLASS_METADATA_KEY, target);
    metadata = metadata === void 0 ? setMetadata : __spreadValues(__spreadValues({}, metadata), setMetadata);
    Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target);
  };
}
function Controller(prefix) {
  return function(target) {
    const setMetadata = { type: "controller", prefix };
    let metadata = Reflect.getMetadata(CLASS_METADATA_KEY, target);
    metadata = metadata === void 0 ? setMetadata : __spreadValues(__spreadValues({}, metadata), setMetadata);
    Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target);
  };
}
function OnInvoke(channel) {
  return function(target, propertyKey) {
    const decorate = { channel, method: propertyKey, type: "invoke" };
    let metadata = Reflect.getMetadata(CLASS_METADATA_KEY, target);
    if (metadata === void 0) {
      metadata = { type: "controller", decorates: [decorate] };
      Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target);
    } else {
      if (metadata.decorates === void 0) metadata.decorates = [];
      metadata.decorates.push(decorate);
      Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target);
    }
  };
}
function OnSend(channel) {
  return function(target, propertyKey) {
    const decorate = { channel, method: propertyKey, type: "send" };
    let metadata = Reflect.getMetadata(CLASS_METADATA_KEY, target);
    if (metadata === void 0) {
      metadata = { type: "controller", decorates: [decorate] };
      Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target);
    } else {
      if (metadata.decorates === void 0) metadata.decorates = [];
      metadata.decorates.push(decorate);
      Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target);
    }
  };
}
function Module(options) {
  return function(target) {
    const setMetadata = { type: "module", options };
    Reflect.defineMetadata(CLASS_METADATA_KEY, setMetadata, target);
  };
}

// src/bootstrap.ts
var import_electron = require("electron");
function Bootstrap(...modules) {
  var _a;
  for (const module2 of modules) {
    const { options } = Reflect.getMetadata(CLASS_METADATA_KEY, module2);
    container.registerModule(module2);
    (_a = options == null ? void 0 : options.controllers) == null ? void 0 : _a.forEach(function(controller) {
      const { type, prefix } = Reflect.getMetadata(CLASS_METADATA_KEY, controller);
      if (type !== "controller") throw new ElectronDIError(`Decorate class "${controller.name}" with @Controller`);
      const resolved = container.resolveDependency(module2, controller);
      const { decorates } = Reflect.getMetadata(CLASS_METADATA_KEY, resolved);
      decorates == null ? void 0 : decorates.forEach(function(value) {
        const channel = prefix ? `${prefix}:${value.channel}` : value.channel;
        const method = resolved[value.method];
        const handler = method.bind(resolved);
        if (value.type === "invoke") {
          import_electron.ipcMain.handle(channel, function(event, ...args) {
            return __async(this, null, function* () {
              const returnValue = yield handler(event, ...args);
              return returnValue;
            });
          });
        }
        if (value.type === "send") {
          import_electron.ipcMain.on(channel, function(event, ...args) {
            return __async(this, null, function* () {
              yield handler(event, ...args);
            });
          });
        }
        Logger(`Listen for ipc.${value.type} in channel: ${channel}`);
      });
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Bootstrap,
  Controller,
  Inject,
  Injectable,
  Module,
  OnInvoke,
  OnSend,
  container
});
//# sourceMappingURL=index.js.map