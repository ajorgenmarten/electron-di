"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
  After: () => After,
  Before: () => Before,
  Bootstrap: () => Bootstrap,
  Controller: () => Controller,
  Global: () => Global,
  IPCEvent: () => IPCEvent,
  Inject: () => Inject,
  Injectable: () => Injectable,
  Logger: () => Logger,
  Module: () => Module,
  OnInvoke: () => OnInvoke,
  OnSend: () => OnSend,
  Payload: () => Payload,
  Request: () => Request,
  Response: () => Response
});
module.exports = __toCommonJS(index_exports);
var import_reflect_metadata = require("reflect-metadata");

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
var module2 = Symbol("electron-di:module");
var global = Symbol("electron-di:global");
var ipcmethod = Symbol("electron-di:ipc-method");
var inject = Symbol("electron-di:inject");
var paramsArg = Symbol("electron-di:params-args");
var middlewares = Symbol("electron-di:middlewares");
var INJECTION_SYMBOLS = {
  global,
  injectable,
  controller,
  module: module2,
  inject,
  middlewares,
  ipcmethod,
  paramsArg
};
var constants_default = INJECTION_SYMBOLS;

// src/decorators/After.ts
function After(token) {
  return function(target, propertyKey, _propertyDescriptor) {
    var _a, _b;
    const level = typeof propertyKey === "undefined" ? "class" : "method";
    const method = level == "class" ? void 0 : propertyKey;
    const type = "After";
    let metadata;
    if (level === "class") {
      metadata = (_a = Reflect.getMetadata(constants_default.middlewares, target)) != null ? _a : {
        middlewares: []
      };
    } else {
      metadata = (_b = Reflect.getMetadata(
        constants_default.middlewares,
        target,
        propertyKey
      )) != null ? _b : { middlewares: [] };
    }
    const itemMetadata = { type, token, method };
    metadata.middlewares.push(itemMetadata);
    if (level === "class") {
      Reflect.defineMetadata(constants_default.middlewares, metadata, target);
    } else {
      Reflect.defineMetadata(
        constants_default.middlewares,
        metadata,
        target,
        propertyKey
      );
    }
  };
}

// src/decorators/Before.ts
function Before(token) {
  return function(target, propertyKey, _propertyDescriptor) {
    var _a, _b;
    const level = typeof propertyKey === "undefined" ? "class" : "method";
    const method = level == "class" ? void 0 : propertyKey;
    const type = "Before";
    let metadata;
    if (level === "class") {
      metadata = (_a = Reflect.getMetadata(constants_default.middlewares, target)) != null ? _a : {
        middlewares: []
      };
    } else {
      metadata = (_b = Reflect.getMetadata(
        constants_default.middlewares,
        target,
        propertyKey
      )) != null ? _b : { middlewares: [] };
    }
    const itemMetadata = { type, token, method };
    metadata.middlewares.push(itemMetadata);
    if (level === "class") {
      Reflect.defineMetadata(constants_default.middlewares, metadata, target);
    } else {
      Reflect.defineMetadata(
        constants_default.middlewares,
        metadata,
        target,
        propertyKey
      );
    }
  };
}

// src/decorators/Payload.ts
function Payload() {
  return function(target, propertyKey, paramIndex) {
    var _a;
    const metadata = (_a = Reflect.getMetadata(
      constants_default.paramsArg,
      target,
      propertyKey
    )) != null ? _a : { params: [] };
    metadata.params[paramIndex] = { type: "Payload" };
    Reflect.defineMetadata(constants_default.paramsArg, metadata, target, propertyKey);
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

// src/decorators/Inject.ts
function Inject(token) {
  if (!token) {
    throw new Error("El token de inyecci\xF3n no puede ser null o undefined");
  }
  return (target, propertyKey, paramIndex) => {
    var _a;
    const metadata = (_a = Reflect.getMetadata(
      constants_default.inject,
      target
    )) != null ? _a : {
      constructorArgs: []
    };
    if (!Array.isArray(metadata.constructorArgs)) {
      metadata.constructorArgs = [];
    }
    metadata.constructorArgs[paramIndex] = token;
    Reflect.defineMetadata(constants_default.inject, metadata, target);
  };
}

// src/decorators/Injectable.ts
function Injectable() {
  return function(target) {
    const metadata = true;
    Reflect.defineMetadata(constants_default.injectable, metadata, target);
  };
}

// src/decorators/IPCEvent.ts
function IPCEvent() {
  return function(target, propertyKey, paramIndex) {
    var _a;
    const metadata = (_a = Reflect.getMetadata(
      constants_default.paramsArg,
      target,
      propertyKey
    )) != null ? _a : { params: [] };
    metadata.params[paramIndex] = { type: "IpcEvent" };
    Reflect.defineMetadata(constants_default.paramsArg, metadata, target, propertyKey);
  };
}

// src/decorators/Module.ts
function Module(options) {
  return function(target) {
    const metadata = { options };
    Reflect.defineMetadata(constants_default.module, metadata, target);
  };
}

// src/decorators/OnInvoke.ts
function OnInvoke(channel) {
  return function(target, propertyKey, descriptor) {
    const metadata = {
      type: "invoke",
      channel
    };
    Reflect.defineMetadata(constants_default.ipcmethod, metadata, target, propertyKey);
  };
}

// src/decorators/OnSend.ts
function OnSend(channel) {
  return function(target, propertyKey, descriptor) {
    const metadata = {
      type: "send",
      channel
    };
    Reflect.defineMetadata(constants_default.ipcmethod, metadata, target, propertyKey);
  };
}

// src/decorators/Request.ts
function Request() {
  return function(target, propertyKey, paramIndex) {
    var _a;
    const metadata = (_a = Reflect.getMetadata(
      constants_default.paramsArg,
      target,
      propertyKey
    )) != null ? _a : { params: [] };
    metadata.params[paramIndex] = { type: "Request" };
    Reflect.defineMetadata(constants_default.paramsArg, metadata, target, propertyKey);
  };
}

// src/decorators/Response.ts
function Response() {
  return function(target, propertyKey, paramIndex) {
    var _a;
    const metadata = (_a = Reflect.getMetadata(
      constants_default.paramsArg,
      target,
      propertyKey
    )) != null ? _a : { params: [] };
    metadata.params[paramIndex] = { type: "Response" };
    Reflect.defineMetadata(constants_default.paramsArg, metadata, target, propertyKey);
  };
}

// src/core/bootstrap.ts
var import_electron = require("electron");

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
var Middleware = class {
  constructor(token, type) {
    this.token = token;
    this.type = type;
  }
  get Type() {
    return this.type;
  }
  get Token() {
    return this.token;
  }
};
var Controller2 = class extends Component {
  constructor(controllerClass) {
    var _a, _b;
    const controllerMetadata = Reflect.getMetadata(
      constants_default.controller,
      controllerClass
    );
    if (typeof controllerMetadata === "undefined")
      throw new Error(
        `La clase ${controllerClass.name} no ha sido decorada con @Controller`
      );
    super(controllerClass, controllerClass);
    this._middlewares = [];
    this._prefix = (_a = controllerMetadata.prefix) != null ? _a : "";
    const middlewareMetadata = (_b = Reflect.getMetadata(
      constants_default.middlewares,
      controllerClass
    )) != null ? _b : { middlewares: [] };
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
    const exports2 = (_d = moduleMetadata.options.exports) != null ? _d : [];
    for (const importModule of imports) {
      this._imports.push(importModule);
    }
    for (const provider of providers) {
      this._providers.push(new Provider(provider));
    }
    for (const controller2 of controllers) {
      this._controllers.push(new Controller2(controller2));
    }
    for (const exportToken of exports2) {
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
    var _a, _b, _c;
    const instance = this._instances.get(token);
    if (instance) return instance;
    try {
      const resolved = (_a = this._providers.find((p) => p.Token === token)) != null ? _a : this._controllers.find((c) => c.Token === token);
      if (resolved) {
        const ResolvedClass = resolved.UseClass;
        const { constructorArgs = [] } = (_b = Reflect.getMetadata(constants_default.inject, ResolvedClass)) != null ? _b : {};
        const dependencies = constructorArgs.map((dep) => {
          const resolvedDep = this.resolve(dep);
          if (!resolvedDep) {
            throw new Error(`No se pudo resolver la dependencia ${dep.name}`);
          }
          return resolvedDep;
        });
        const resolvedInstance = new ResolvedClass(...dependencies);
        this._instances.set(token, resolvedInstance);
        return resolvedInstance;
      }
      return (_c = this._linkObject.findInGlobalModules(token)) != null ? _c : this._linkObject.findInSharedModules(token, this._imports);
    } catch (error) {
      throw new Error(
        `Error al resolver ${token.name}: ${error.message}`
      );
    }
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
  cacheTokenPath(module3) {
    var _a;
    const tokens = /* @__PURE__ */ new Set([
      ...module3.Controllers.map((c) => c.Token),
      ...module3.Providers.map((p) => p.Token)
    ]);
    for (const token of tokens) {
      const cached = (_a = this._cache.get(token)) != null ? _a : [];
      if (!cached.includes(module3.Class)) {
        cached.push(module3.Class);
        this._cache.set(token, cached);
      }
    }
  }
  findInGlobalModules(token) {
    var _a;
    const cached = this._cache.get(token);
    if (!cached) return null;
    const module3 = this._modules.find(
      (module4) => cached.includes(module4.Class) && module4.IsGlobal
    );
    return (_a = module3 == null ? void 0 : module3.resolve(token)) != null ? _a : null;
  }
  findInSharedModules(token, modules) {
    const cached = this._cache.get(token);
    if (!cached) return null;
    const filteredModule = cached.filter((moduleClass) => modules.includes(moduleClass)).map((moduleClass) => {
      return this._modules.find((module3) => module3.Class === moduleClass);
    }).filter((module3) => module3 == null ? void 0 : module3.Exports.includes(token)).shift();
    if (!filteredModule) return null;
    return filteredModule.resolve(token);
  }
  registerModule(module3) {
    const exist = this._modules.find(
      (moduleItem) => moduleItem.Class === module3
    );
    if (exist) return;
    const linkObject = {
      findInGlobalModules: this.findInGlobalModules.bind(this),
      findInSharedModules: this.findInSharedModules.bind(this)
    };
    const moduleClass = new Module2(module3, linkObject);
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
    const module3 = this._modules.find(
      (module4) => module4.Class === exist[0]
    );
    return module3.resolve(token);
  }
  get Modules() {
    return this._modules;
  }
};

// src/core/params.ts
var Request2 = class {
  constructor(event, payload) {
    this.event = event;
    this.payload = payload;
  }
  get Event() {
    return this.event;
  }
  get Payload() {
    return this.payload;
  }
  set Payload(value) {
    this.payload = value;
  }
};
var Response2 = class {
  constructor() {
    this.responseData = void 0;
  }
  send(payload) {
    this.responseData = payload;
  }
  get Data() {
    return typeof this.responseData === "undefined" ? void 0 : JSON.parse(JSON.stringify(this.responseData));
  }
  set Data(data) {
    this.responseData = data;
  }
};

// src/core/bootstrap.ts
var IPCError = class extends Error {
  constructor(data) {
    super(data.message);
    this.details = data.details;
  }
};
var MetadataManager = class {
  static getMethodMetadata(instance, method) {
    return Reflect.getMetadata(constants_default.ipcmethod, instance, method);
  }
  static getParamsMetadata(instance, method) {
    var _a;
    return (_a = Reflect.getMetadata(constants_default.paramsArg, instance, method)) != null ? _a : { params: [] };
  }
  static getMethodMiddlewaresMetadata(instance, method) {
    var _a;
    return (_a = Reflect.getMetadata(constants_default.middlewares, instance, method)) != null ? _a : {
      middlewares: []
    };
  }
};
var MiddlewareHandler = class {
  static executeBeforeMiddlewares(middlewares2, context) {
    return __async(this, null, function* () {
      if (!middlewares2 || !Array.isArray(middlewares2)) {
        const message = "Middlewares Before no es un array v\xE1lido";
        Logger.warn(message);
        return { success: false, reason: message };
      }
      for (const middleware of middlewares2) {
        const params = this.resolveMiddlewareParams(middleware, context);
        const result = yield middleware.execute(...params);
        if (!result)
          return {
            success: false,
            reason: `Middleware ${middleware.constructor.name} ha retornado "false".`
          };
      }
      return { success: true };
    });
  }
  static executeAfterMiddlewares(middlewares2, context) {
    return __async(this, null, function* () {
      const promises = middlewares2.map((middleware) => {
        const params = this.resolveMiddlewareParams(middleware, context);
        return middleware.execute(...params);
      });
      yield Promise.all(promises);
    });
  }
  static resolveMiddlewareParams(middleware, context) {
    const metadata = MetadataManager.getParamsMetadata(middleware, "execute");
    return ParamsResolver.resolveParams(metadata, context);
  }
};
var ParamsResolver = class {
  static resolveParams({ params }, context) {
    return params.map((param) => {
      switch (param.type) {
        case "IpcEvent":
          return context.request.Event;
        case "Request":
          return context.request;
        case "Payload":
          return context.request.Payload;
        case "Response":
          return context.response;
        default:
          return void 0;
      }
    });
  }
};
var IPCHandler = class {
  static handleError(error) {
    if (error instanceof IPCError) {
      return {
        success: false,
        reason: error.message,
        details: error.details
      };
    }
    Logger.error(error.message || "Internal Error", "ELECTRON DI");
    return {
      success: false,
      reason: "Internal Error",
      details: error
    };
  }
  static handleRequest(instance, method, context, middlewares2) {
    return __async(this, null, function* () {
      var _a;
      try {
        const beforeResult = yield MiddlewareHandler.executeBeforeMiddlewares(
          middlewares2.before,
          context
        );
        if (!beforeResult.success) {
          Logger.error((_a = beforeResult.reason) != null ? _a : "Un middleware no se ha cumplido");
          return beforeResult;
        }
      } catch (error) {
        return this.handleError(error);
      }
      const params = ParamsResolver.resolveParams(
        MetadataManager.getParamsMetadata(instance, method),
        context
      );
      try {
        const result = yield instance[method](...params);
        const response = this.formatResponse(result, context.response);
        MiddlewareHandler.executeAfterMiddlewares(
          middlewares2.after,
          context
        ).catch((error) => {
          Logger.error(error.message, "ELECTRON DI");
        });
        return response;
      } catch (error) {
        return this.handleError(error);
      }
    });
  }
  static formatResponse(result, response) {
    if (typeof result === "undefined" && typeof response.Data === "undefined")
      return void 0;
    if (typeof result === "undefined" && typeof response.Data !== "undefined")
      return response.Data;
    response.Data = result;
    return response.Data;
  }
  static registerHandler(channel, instance, method, type, middlewares2) {
    if (!channel || typeof channel !== "string") {
      throw new Error("El channel debe ser un string v\xE1lido");
    }
    if (import_electron.ipcMain.listeners(channel).length > 0) {
      Logger.warn(
        `Ya existe un handler registrado para el channel: ${channel}`
      );
      return;
    }
    const handler = (event, ...args) => __async(this, null, function* () {
      const context = {
        request: new Request2(event, args[0]),
        response: new Response2()
      };
      return this.handleRequest(instance, method, context, middlewares2);
    });
    type === "invoke" ? import_electron.ipcMain.handle(channel, handler) : import_electron.ipcMain.on(channel, handler);
  }
};
function Bootstrap(module3) {
  const container = new Container();
  container.registerModule(module3);
  const controllers = container.Modules.flatMap(
    (module4) => module4.Controllers
  ).map((controller2) => ({
    instance: container.resolve(controller2.Token),
    prefix: controller2.Prefix.trim(),
    middlewares: controller2.Middlewares.map((m) => ({
      instance: container.resolve(m.Token),
      type: m.Type
    }))
  }));
  for (const controller2 of controllers) {
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(controller2.instance)
    ).filter(
      (name) => name !== "constructor" && typeof controller2.instance[name] === "function"
    );
    for (const method of methods) {
      const metadata = MetadataManager.getMethodMetadata(
        controller2.instance,
        method
      );
      if (!metadata) continue;
      const channel = controller2.prefix ? `${controller2.prefix}:${metadata.channel.trim()}` : metadata.channel.trim();
      const methodMiddlewares = MetadataManager.getMethodMiddlewaresMetadata(
        controller2.instance,
        method
      ).middlewares;
      const middlewares2 = {
        before: [
          ...controller2.middlewares.filter((m) => m.type === "Before").map((m) => m.instance),
          ...methodMiddlewares.filter((m) => m.type === "Before").map((m) => container.resolve(m.token))
        ].reverse(),
        after: [
          ...controller2.middlewares.filter((m) => m.type === "After").map((m) => m.instance),
          ...methodMiddlewares.filter((m) => m.type === "After").map((m) => container.resolve(m.token))
        ].reverse()
      };
      IPCHandler.registerHandler(
        channel,
        controller2.instance,
        method,
        metadata.type,
        middlewares2
      );
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  After,
  Before,
  Bootstrap,
  Controller,
  Global,
  IPCEvent,
  Inject,
  Injectable,
  Logger,
  Module,
  OnInvoke,
  OnSend,
  Payload,
  Request,
  Response
});
//# sourceMappingURL=index.js.map