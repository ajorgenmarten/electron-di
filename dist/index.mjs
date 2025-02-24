// src/index.ts
import "reflect-metadata";

// src/core/logger.ts
var COLORS = {
  BACKGROUND: {
    LIGHT: {
      BLACK: "100",
      RED: "101",
      GREEN: "102",
      YELLOW: "103",
      BLUE: "104",
      MAGENTA: "105",
      CYAN: "106",
      WHITE: "107",
      DEFAULT: "109"
    },
    DARK: {
      BLACK: "40",
      RED: "41",
      GREEN: "42",
      YELLOW: "43",
      BLUE: "44",
      MAGENTA: "45",
      CYAN: "46",
      WHITE: "47",
      DEFAULT: "49"
    }
  },
  FOREGROUND: {
    LIGHT: {
      BLACK: "90",
      RED: "91",
      GREEN: "92",
      YELLOW: "93",
      BLUE: "94",
      MAGENTA: "95",
      CYAN: "96",
      WHITE: "97",
      DEFAULT: "99"
    },
    DARK: {
      BLACK: "30",
      RED: "31",
      GREEN: "32",
      YELLOW: "33",
      BLUE: "34",
      MAGENTA: "35",
      CYAN: "36",
      WHITE: "37",
      DEFAULT: "39"
    }
  }
};
var genTheme = ({ font, background }) => {
  const theme = [
    font ? COLORS.FOREGROUND[font.colorType][font.colorValue] : void 0,
    background ? COLORS.BACKGROUND[background.colorType][background.colorValue] : void 0
  ].filter(Boolean).join(";");
  return theme ? `\x1B[${theme}m[%s]\x1B[0m` : `%s`;
};
var THEMES = {
  log: genTheme({ font: { colorType: "LIGHT", colorValue: "BLACK" } }),
  success: genTheme({ font: { colorType: "LIGHT", colorValue: "GREEN" } }),
  error: genTheme({ font: { colorType: "LIGHT", colorValue: "RED" } }),
  info: genTheme({ font: { colorType: "LIGHT", colorValue: "BLUE" } }),
  warn: genTheme({ font: { colorType: "LIGHT", colorValue: "YELLOW" } })
};
var Logger = class {
  static log(message, title = "ELECTRON DI", ...args) {
    console.log(`${THEMES.log}:	${message}`, title, ...args);
  }
  static info(message, title = "ELECTRON DI", ...args) {
    console.log(`${THEMES.info}:	${message}`, title, ...args);
  }
  static success(message, title = "ELECTRON DI", ...args) {
    console.log(`${THEMES.success}:	${message}`, title, ...args);
  }
  static error(message, title = "ELECTRON DI", ...args) {
    console.log(`${THEMES.error}:	${message}`, title, ...args);
  }
  static warn(message, title = "ELECTRON DI", ...args) {
    console.log(`${THEMES.warn}:	${message}`, title, ...args);
  }
  static customLogger(options) {
    const titleTheme = genTheme(options.title);
    const messageTheme = genTheme(options.message);
    return function(message, title = "LOGGER", ...args) {
      console.log(`${titleTheme}:	${messageTheme}`, title, message, ...args);
    };
  }
};

// src/core/constants.ts
var injectable = Symbol("electron-di:injectable");
var controller = Symbol("electron-di:controller");
var contextmodule = Symbol("electron-di:module");
var global = Symbol("electron-di:global");
var ipcmethod = Symbol("electron-di:ipc-method");
var inject = Symbol("electron-di:inject");
var paramsArg = Symbol("electron-di:params-args");
var middlewares = Symbol("electron-di:middlewares");
var INJECTION_SYMBOLS = {
  global,
  injectable,
  controller,
  module: contextmodule,
  inject,
  before: middlewares,
  after: middlewares,
  onsend: ipcmethod,
  oninvoke: ipcmethod,
  body: paramsArg,
  headers: paramsArg,
  request: paramsArg,
  event: paramsArg,
  response: paramsArg
};
var constants_default = INJECTION_SYMBOLS;

// src/core/ensurances.ts
function HaveNotBeenApplied(target, decorators) {
  for (const decorator of decorators) {
    const metadata = Reflect.getMetadata(constants_default[decorator], target);
    if (typeof metadata !== "undefined")
      throw new Error(`Ha sido decorado con ${decorator}`);
  }
}
function HaveBeenApplied(target, decorators) {
  for (const decorator of decorators) {
    const metadata = Reflect.getMetadata(constants_default[decorator], target);
    if (typeof metadata === "undefined")
      throw new Error(`No se ha aplicado el decorador ${decorator}`);
  }
}

// src/decorators/After.ts
function After(token) {
  return function(target, propertyKey, _propertyDescriptor) {
    const level = typeof propertyKey === "undefined" ? "class" : "method";
    const method = level == "class" ? void 0 : propertyKey;
    const type = "After";
    const targetDefinition = level == "class" ? target : target.prototype;
    HaveBeenApplied(targetDefinition, ["controller"]);
    HaveNotBeenApplied(targetDefinition, ["injectable", "module"]);
    let metadata = Reflect.getMetadata(
      constants_default.after,
      targetDefinition
    );
    const itemMetadata = { type, token, method };
    if (typeof metadata === "undefined") metadata = { middlewares: [] };
    metadata.middlewares.push(itemMetadata);
    Reflect.defineMetadata(constants_default.after, metadata, targetDefinition);
  };
}

// src/decorators/Before.ts
function Before(token) {
  return function(target, propertyKey, _propertyDescriptor) {
    const level = typeof propertyKey === "undefined" ? "class" : "method";
    const method = level == "class" ? void 0 : propertyKey;
    const type = "Before";
    const targetDefinition = level == "class" ? target : target.prototype;
    HaveBeenApplied(targetDefinition, ["controller"]);
    HaveNotBeenApplied(targetDefinition, ["injectable", "module"]);
    let metadata = Reflect.getMetadata(
      constants_default.before,
      targetDefinition
    );
    const itemMetadata = { type, token, method };
    if (typeof metadata === "undefined") metadata = { middlewares: [] };
    metadata.middlewares.push(itemMetadata);
    Reflect.defineMetadata(constants_default.before, metadata, targetDefinition);
  };
}

// src/decorators/Body.ts
function Body(key) {
  return function(target, propertyKey, paramIndex) {
    const targetDefinition = target.prototype;
    HaveNotBeenApplied(targetDefinition, ["injectable", "module"]);
    HaveBeenApplied(targetDefinition, ["controller"]);
    let metadata = Reflect.getMetadata(
      constants_default.body,
      target,
      propertyKey
    );
    if (typeof metadata === "undefined") metadata = { params: [] };
    metadata.params[paramIndex] = { type: "Body", key };
    Reflect.defineMetadata(constants_default.body, metadata, target, propertyKey);
  };
}

// src/decorators/Controller.ts
function Controller(prefix) {
  return function(target) {
    const metadata = { prefix };
    Reflect.defineMetadata(constants_default.controller, metadata, target);
  };
}

// src/decorators/Global.ts
function Global() {
  return function(target) {
    const metadata = true;
    Reflect.defineMetadata(constants_default.global, metadata, target);
  };
}

// src/decorators/Injectable.ts
function Injectable() {
  return function(target) {
    const metadata = true;
    Reflect.defineMetadata(constants_default.injectable, metadata, target);
  };
}

// src/decorators/Module.ts
function Module(options) {
  return function(target) {
    const metadata = { options };
    Reflect.defineMetadata(constants_default.module, metadata, target);
  };
}

// src/decorators/Headers.ts
function Headers(key) {
  return function(target, propertyKey, paramIndex) {
    const targetDefinition = target.prototype;
    HaveNotBeenApplied(targetDefinition, ["injectable", "module"]);
    HaveBeenApplied(targetDefinition, ["controller"]);
    let metadata = Reflect.getMetadata(
      constants_default.headers,
      target,
      propertyKey
    );
    console.log(metadata);
    if (typeof metadata === "undefined") metadata = { params: [] };
    metadata.params[paramIndex] = { type: "Headers", key };
    Reflect.defineMetadata(constants_default.headers, metadata, target, propertyKey);
  };
}

// src/decorators/IPCEvent.ts
function IPCEvent(key) {
  return function(target, propertyKey, paramIndex) {
    const targetDefinition = target.prototype;
    HaveNotBeenApplied(targetDefinition, ["injectable", "module"]);
    HaveBeenApplied(targetDefinition, ["controller"]);
    let metadata = Reflect.getMetadata(
      constants_default.event,
      target,
      propertyKey
    );
    if (typeof metadata === "undefined") metadata = { params: [] };
    metadata.params[paramIndex] = { type: "IpcEvent", key };
    Reflect.defineMetadata(constants_default.event, metadata, target, propertyKey);
  };
}

// src/decorators/Request.ts
function Request(key) {
  return function(target, propertyKey, paramIndex) {
    const targetDefinition = target.prototype;
    HaveNotBeenApplied(targetDefinition, ["injectable", "module"]);
    HaveBeenApplied(targetDefinition, ["controller"]);
    let metadata = Reflect.getMetadata(
      constants_default.request,
      target,
      propertyKey
    );
    if (typeof metadata === "undefined") metadata = { params: [] };
    metadata.params[paramIndex] = { type: "Request", key };
    Reflect.defineMetadata(constants_default.request, metadata, target, propertyKey);
  };
}

// src/decorators/Inject.ts
function Inject(token) {
  return function(target, propertyKey, paramIndex) {
    var _a;
    const metadata = (_a = Reflect.getMetadata(
      constants_default.inject,
      target
    )) != null ? _a : { constructorArgs: [] };
    metadata.constructorArgs[paramIndex] = token;
    Reflect.defineMetadata(constants_default.inject, metadata, target);
  };
}

// src/decorators/OnSend.ts
function OnSend(channel) {
  return function(target, propertyKey, descriptor) {
    var _a;
    const metadata = (_a = Reflect.getMetadata(
      constants_default.onsend,
      target,
      propertyKey
    )) != null ? _a : { methods: [] };
    const metadataItem = {
      type: "send",
      channel
    };
    metadata.methods.push(metadataItem);
    Reflect.defineMetadata(constants_default.onsend, metadata, target, propertyKey);
  };
}

// src/decorators/OnInvoke.ts
function OnInvoke(channel) {
  return function(target, propertyKey, descriptor) {
    var _a;
    const metadata = (_a = Reflect.getMetadata(
      constants_default.onsend,
      target,
      propertyKey
    )) != null ? _a : { methods: [] };
    const metadataItem = {
      type: "invoke",
      channel
    };
    metadata.methods.push(metadataItem);
    Reflect.defineMetadata(constants_default.onsend, metadata, target, propertyKey);
  };
}

// src/core/container.ts
var Component = class {
  constructor(_token, _useClass) {
    this._token = _token;
    this._useClass = _useClass;
  }
  get Token() {
    return this._token;
  }
  get UseClass() {
    return this._useClass;
  }
};
var Provider = class extends Component {
  constructor(provider) {
    var _a;
    const [token, useClass] = typeof provider === "function" ? [provider, provider] : [provider.provide, provider.useClass];
    const injectableMetadata = (_a = Reflect.getMetadata(constants_default.injectable, useClass)) != null ? _a : false;
    if (!injectableMetadata)
      throw new Error(
        `La clase ${useClass.name} no ha sido decorada con @Injectable`
      );
    super(token, useClass);
  }
};
var Controller2 = class extends Component {
  constructor(controllerClass) {
    var _a;
    const controllerMetadata = Reflect.getMetadata(
      constants_default.controller,
      controllerClass
    );
    if (typeof controllerMetadata === "undefined")
      throw new Error(
        `La clase ${controllerClass.name} no ha sido decorada con @Controller`
      );
    super(controllerClass, controllerClass);
    this._prefix = (_a = controllerMetadata.prefix) != null ? _a : "";
  }
  get Prefix() {
    return this._prefix;
  }
};
var Module2 = class {
  constructor(moduleClass, linkObject) {
    this._controllers = [];
    this._providers = [];
    this._imports = [];
    this._exports = [];
    this._instances = /* @__PURE__ */ new Map();
    this._isGlobal = false;
    var _a, _b, _c, _d;
    const moduleMetadata = Reflect.getMetadata(
      constants_default.module,
      moduleClass
    );
    if (typeof moduleMetadata === "undefined")
      throw new Error(
        `La clase ${moduleClass.name} no ha sido decorada con @Module`
      );
    const globalMetadata = Reflect.getMetadata(
      constants_default.global,
      moduleClass
    );
    this._isGlobal = typeof globalMetadata !== "undefined";
    const imports = (_a = moduleMetadata.options.imports) != null ? _a : [];
    const providers = (_b = moduleMetadata.options.providers) != null ? _b : [];
    const controllers = (_c = moduleMetadata.options.controllers) != null ? _c : [];
    const exports = (_d = moduleMetadata.options.exports) != null ? _d : [];
    for (const importModule of imports) {
      this._imports.push(importModule);
    }
    for (const provider of providers) {
      this._providers.push(new Provider(provider));
    }
    for (const controller2 of controllers) {
      this._controllers.push(new Controller2(controller2));
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
  resolve(token) {
    const instance = this._instances.get(token);
    if (instance) return instance;
    const resolved = this._providers.find((provider) => provider.Token === token) || this._controllers.find((controller2) => controller2.Token === token);
    if (resolved) {
      const ResolvedClass = resolved.UseClass;
      const { constructorArgs } = Reflect.getMetadata(
        constants_default.inject,
        ResolvedClass
      ) || { constructorArgs: [] };
      const ResolvedDependencies = constructorArgs.map(
        (dependency) => this.resolve(dependency)
      );
      const resolvedInstance = new ResolvedClass(...ResolvedDependencies);
      this._instances.set(token, resolvedInstance);
      return resolvedInstance;
    } else {
      let instance2 = this._linkObject.findInGlobalModules(token);
      if (instance2) return instance2;
      instance2 = this._linkObject.findInSharedModules(token, this._imports);
      if (instance2) return instance2;
    }
    return null;
  }
};
var Container = class {
  constructor() {
    this._modules = [];
    this._cache = /* @__PURE__ */ new Map();
  }
  /**
   * Esta función es para cachear los tokens que son tanto los proveedores como los controladores,
   * el cache funciona de la siguiente manera:
   * Se obtienen todos los tokens del modulo que son los proveedores y los controladores
   * Luego se registra cada token como identificador del cual el valor va a ser el o los modulos donde se encuentra el token
   * @param module Modulo del cual se va a cachear los tokens que son tanto los proveedores como los controladores
   */
  cacheTokenPath(module) {
    var _a;
    const getTokens = (components) => {
      return components.map((component) => component.Token);
    };
    const tokens = [
      getTokens(module.Controllers),
      getTokens(module.Providers)
    ].flat();
    for (const token of tokens) {
      const cached = (_a = this._cache.get(token)) != null ? _a : [];
      if (cached.includes(module.Class)) continue;
      cached.push(module.Class);
      this._cache.set(token, cached);
    }
  }
  findInGlobalModules(token) {
    const cached = this._cache.get(token);
    if (!cached) return null;
    const module = this._modules.filter((module2) => cached.includes(module2.Class)).shift();
    if (!module) return null;
    if (!module.IsGlobal) return null;
    return module.resolve(token);
  }
  findInSharedModules(token, modules) {
    const cached = this._cache.get(token);
    if (!cached) return null;
    const filteredModule = cached.filter((moduleClass) => modules.includes(moduleClass)).map((moduleClass) => {
      return this._modules.find((module) => module.Class === moduleClass);
    }).filter((module) => module == null ? void 0 : module.Exports.includes(token)).shift();
    if (!filteredModule) return null;
    return filteredModule.resolve(token);
  }
  registerModule(module) {
    const exist = this._modules.find(
      (moduleItem) => moduleItem.Class === module
    );
    if (exist) return;
    const linkObject = {
      findInGlobalModules: this.findInGlobalModules.bind(this),
      findInSharedModules: this.findInSharedModules.bind(this)
    };
    const moduleClass = new Module2(module, linkObject);
    for (const moduleImported of moduleClass.Imports) {
      this.registerModule(moduleImported);
    }
    this._modules.push(moduleClass);
    this.cacheTokenPath(moduleClass);
  }
  resolve(token) {
    const exist = this._cache.get(token);
    if (!exist)
      throw new Error(
        `No se ha encontrado ninguna instancia para ${token.name}`
      );
    const module = this._modules.find(
      (module2) => module2.Class === exist[0]
    );
    return module.resolve(token);
  }
  get Modules() {
    return this._modules;
  }
};

// src/core/bootstrap.ts
function Bootstrap(module) {
  const container = new Container();
  container.registerModule(module);
  const controllers = container.Modules.map((module2) => module2.Controllers).flat().map((controller3) => container.resolve(controller3.Token));
  const controller2 = controllers[1];
  console.log(controller2.randomGreeting());
  console.log(controller2.randomGreeting());
  console.log(controller2.randomGreeting());
  console.log(controller2.randomGreeting());
  console.log(controller2.randomGreeting());
}
export {
  After,
  Before,
  Body,
  Bootstrap,
  Controller,
  Global,
  Headers,
  IPCEvent,
  Inject,
  Injectable,
  Logger,
  Module,
  OnInvoke,
  OnSend,
  Request
};
//# sourceMappingURL=index.mjs.map