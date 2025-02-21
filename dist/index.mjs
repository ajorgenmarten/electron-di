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
    HaveNotBeenApplied(target, ["injectable", "module", "global"]);
    const metadata = { prefix };
    Reflect.defineMetadata(constants_default.controller, metadata, target);
  };
}

// src/decorators/Global.ts
function Global() {
  return function(target) {
    HaveNotBeenApplied(target, ["injectable", "controller"]);
    HaveBeenApplied(target, ["module"]);
    const metadata = true;
    Reflect.defineMetadata(constants_default.global, metadata, target);
  };
}

// src/decorators/Injectable.ts
function Injectable() {
  return function(target) {
    HaveNotBeenApplied(target, ["controller", "module", "global"]);
    const metadata = true;
    Reflect.defineMetadata(constants_default.injectable, metadata, target);
  };
}

// src/decorators/Module.ts
function Module(options) {
  return function(target) {
    HaveNotBeenApplied(target, ["controller", "injectable"]);
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
var Module2 = class {
  constructor(name, options, linkResolveForModule, linkResolveForGlobal) {
    this.name = name;
    this.options = options;
    this.linkResolveForModule = linkResolveForModule;
    this.linkResolveForGlobal = linkResolveForGlobal;
    this.instances = /* @__PURE__ */ new Map();
  }
  get Name() {
    return this.name;
  }
  get Controllers() {
    return this.options.controllers;
  }
  resolveGlobal(token) {
    const instance = this.linkResolveForGlobal(token);
    return instance;
  }
  resolveExternal(token) {
    if (typeof this.options.imports === "undefined") return null;
    for (const module of this.options.imports) {
      const instance = this.linkResolveForModule(module.name, token);
      if (!instance) continue;
      return instance;
    }
    return null;
  }
  resolve(token) {
    if (this.instances.has(token)) return this.instances.get(token);
    if (typeof this.options.providers === "undefined") {
      let instance = this.resolveExternal(token);
      if (instance) return instance;
      instance = this.resolveGlobal(token);
      if (instance) return instance;
    } else
      for (const provider of this.options.providers) {
        const [provided, useClass] = typeof provider === "function" ? [provider, provider] : [provider.provide, provider.useClass];
        if (provided !== token) continue;
        const injectMetadata = Reflect.getMetadata(
          constants_default.inject,
          useClass
        );
        let instance = null;
        if (typeof injectMetadata === "undefined") {
          instance = new useClass();
          this.instances.set(provided, instance);
        } else {
          const instances = injectMetadata.constructorArgs.map(
            (injectToken) => {
              this.resolve(injectToken);
            }
          );
          instance = new useClass(...instances);
          this.instances.set(provided, instance);
        }
        return instance;
      }
    throw new Error(
      `No se ha encontrado el proveedor ${token.name} en el m\xF3dulo ${this.name}`
    );
  }
};
var Container = class {
  constructor() {
    this.modules = /* @__PURE__ */ new Map();
    this.globalModules = [];
  }
  registerTreeModule(module) {
    HaveBeenApplied(module, ["module"]);
    const { options } = Reflect.getMetadata(
      constants_default.module,
      module
    );
    const name = module.name;
    const ModuleClass = new Module2(
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
    const isGlobal = Reflect.getMetadata(constants_default.global, module);
    if (isGlobal === true) this.globalModules.push(name);
  }
  resolve(module, token) {
    const ModuleClass = this.modules.get(module);
    if (!ModuleClass)
      throw new Error(`No se ha encontrado el m\xF3dulo ${module}`);
    return ModuleClass.resolve(token);
  }
  resolveGlobal(token) {
    for (const module of this.globalModules) {
      const ModuleClass = this.modules.get(module);
      const instance = ModuleClass == null ? void 0 : ModuleClass.resolve(token);
      if (instance) return instance;
    }
    return null;
  }
  upControllers() {
    var _a;
    for (const module of this.modules.values()) {
      if (typeof module.Controllers === "undefined") continue;
      console.log("module.Controllers: ", module);
      for (const controller2 of module.Controllers) {
        const controllerMetadata = Reflect.getMetadata(
          constants_default.controller,
          controller2
        );
        const injectMetadata = (_a = Reflect.getMetadata(
          constants_default.inject,
          controller2
        )) != null ? _a : { constructorArgs: [] };
        const argsInstances = injectMetadata.constructorArgs.map(
          (token) => module.resolve(token)
        );
        const controllerInstance = new controller2(...argsInstances);
        console.log("\ncontrollerInstance: ", controllerInstance);
      }
    }
  }
};

// src/core/bootstrap.ts
function Bootstrap(module) {
  const container = new Container();
  container.registerTreeModule(module);
  container.upControllers();
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