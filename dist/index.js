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
  After: () => After,
  Before: () => Before,
  Bootstrap: () => Bootstrap,
  Controller: () => Controller,
  Global: () => Global,
  Headers: () => Headers,
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
function Payload(key) {
  return function(target, propertyKey, paramIndex) {
    var _a;
    const metadata = (_a = Reflect.getMetadata(
      constants_default.paramsArg,
      target,
      propertyKey
    )) != null ? _a : { params: [] };
    metadata.params[paramIndex] = { type: "Payload", key };
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

// src/decorators/Headers.ts
function Headers(key) {
  return function(target, propertyKey, paramIndex) {
    var _a;
    const metadata = (_a = Reflect.getMetadata(
      constants_default.paramsArg,
      target,
      propertyKey
    )) != null ? _a : { params: [] };
    metadata.params[paramIndex] = { type: "Headers", key };
    Reflect.defineMetadata(constants_default.paramsArg, metadata, target, propertyKey);
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

// src/decorators/Injectable.ts
function Injectable() {
  return function(target) {
    const metadata = true;
    Reflect.defineMetadata(constants_default.injectable, metadata, target);
  };
}

// src/decorators/IPCEvent.ts
function IPCEvent(key) {
  return function(target, propertyKey, paramIndex) {
    var _a;
    const metadata = (_a = Reflect.getMetadata(
      constants_default.paramsArg,
      target,
      propertyKey
    )) != null ? _a : { params: [] };
    metadata.params[paramIndex] = { type: "IpcEvent", key };
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
  cacheTokenPath(module3) {
    var _a;
    const getTokens = (components) => {
      return components.map((component) => component.Token);
    };
    const tokens = [
      getTokens(module3.Controllers),
      getTokens(module3.Providers)
    ].flat();
    for (const token of tokens) {
      const cached = (_a = this._cache.get(token)) != null ? _a : [];
      if (cached.includes(module3.Class)) continue;
      cached.push(module3.Class);
      this._cache.set(token, cached);
    }
  }
  findInGlobalModules(token) {
    const cached = this._cache.get(token);
    if (!cached) return null;
    const module3 = this._modules.filter((module4) => cached.includes(module4.Class)).shift();
    if (!module3) return null;
    if (!module3.IsGlobal) return null;
    return module3.resolve(token);
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
  constructor(argument) {
    this.headers = {};
    this.payload = void 0;
    this.headers = this.validateHeaders(argument == null ? void 0 : argument.headers);
    this.payload = argument == null ? void 0 : argument.payload;
  }
  validateHeaders(headers) {
    if (typeof headers === "undefined") return {};
    if (typeof headers !== "object")
      throw new Error(
        "Headers debe ser un objeto de tipo Record<string, string>"
      );
    const claves = Object.keys(headers);
    for (const clave of claves) {
      if (typeof clave !== "string" || typeof headers[clave] !== "string")
        throw new Error(
          "Headers debe ser un objeto de tipo Record<string, string>"
        );
    }
    return headers;
  }
  toPlainObject() {
    return {
      headers: __spreadValues({}, this.headers),
      payload: this.payload ? this.payload : void 0
    };
  }
};
var Response2 = class {
  constructor() {
    this.headers = {};
    this.payload = void 0;
  }
  /**
   * Función para agregar o modificar una cabecera de la respuesta
   * @param key clave de la cabecera que se va a agregar, modificar o eliminar
   * @param value valor de la clave de la cebecera, si es undefined se elimina la cabecera
   * @returns {Response} la misma instancia de la clase Response
   */
  header(key, value) {
    if (typeof value === "undefined") delete this.headers[key];
    else this.headers[key] = value.toString();
    return this;
  }
  /**
   * Función para establecer el payload de la respuesta
   * @param payload Estable el payload de la respuesta
   * @returns
   */
  send(payload) {
    this.payload = payload;
    return this;
  }
  get Payload() {
    return this.payload;
  }
  get Headers() {
    return this.headers;
  }
  toPlainObject() {
    return {
      headers: __spreadValues({}, this.headers),
      payload: this.payload ? this.payload : void 0
    };
  }
};

// src/core/bootstrap.ts
function Bootstrap(module3) {
  const container = new Container();
  container.registerModule(module3);
  const getControllerMiddlewaresInfo = (controller2) => {
    return controller2.Middlewares.map((middlewareMetadata) => {
      const middlewareInstance = container.resolve(middlewareMetadata.Token);
      const middlewareType = middlewareMetadata.Type;
      return { middlewareInstance, middlewareType };
    });
  };
  const getControllersInfo = (container2) => {
    return container2.Modules.map((module4) => module4.Controllers).flat().map((controller2) => {
      const instance = container2.resolve(controller2.Token);
      const prefix = controller2.Prefix.trim();
      const middlewares2 = getControllerMiddlewaresInfo(controller2);
      return { instance, prefix, middlewares: middlewares2 };
    });
  };
  const getMethodNamesFromInstance = (instance) => {
    const prototype = Object.getPrototypeOf(instance);
    return Object.getOwnPropertyNames(prototype).filter((methodName) => {
      return typeof prototype[methodName] === "function" && methodName !== "constructor";
    });
  };
  const getMethodMetadata = (instance, method) => {
    const methodMetadata = Reflect.getMetadata(
      constants_default.ipcmethod,
      instance,
      method
    );
    return methodMetadata;
  };
  const getParamsMetadata = (instance, method) => {
    var _a;
    const paramsMetadata = (_a = Reflect.getMetadata(
      constants_default.paramsArg,
      instance,
      method
    )) != null ? _a : { params: [] };
    return paramsMetadata;
  };
  const getMethodMiddlewaresMetadata = (instance, method) => {
    var _a;
    const middlewaresMetadata = (_a = Reflect.getMetadata(
      constants_default.middlewares,
      instance,
      method
    )) != null ? _a : { middlewares: [] };
    return middlewaresMetadata;
  };
  const resolveParams = ({ params }, request, response, event) => {
    return params.map((param) => {
      if (param.type === "IpcEvent") return event;
      if (param.type === "Request") return request;
      if (param.type === "Headers") return request.headers;
      if (param.type === "Payload") return request.payload;
      if (param.type === "Response") return response;
      return void 0;
    });
  };
  const groupBy = (array, key, mapper) => {
    const resultRecord = {};
    for (const item of array) {
      const value = item[key];
      if (value in resultRecord) {
        resultRecord[value].push(
          typeof mapper === "function" ? mapper(item) : item
        );
      } else {
        resultRecord[value] = [
          typeof mapper === "function" ? mapper(item) : item
        ];
      }
    }
    return resultRecord;
  };
  const applyBeforeMiddlewares = (middlewares2, request, response, event) => __async(this, null, function* () {
    for (const middleware of middlewares2) {
      const middlewareParamsMetadata = Reflect.getMetadata(
        constants_default.paramsArg,
        middleware,
        "excecute"
      );
      const middlewareParams = resolveParams(
        middlewareParamsMetadata,
        request,
        response,
        event
      );
      const res = yield middleware.excecute(...middlewareParams);
      if (res === false) return false;
    }
    return true;
  });
  const controllersInfo = getControllersInfo(container);
  for (const { instance, prefix, middlewares: middlewares2 } of controllersInfo) {
    const instanceMethdoNames = getMethodNamesFromInstance(instance);
    for (const method of instanceMethdoNames) {
      const methodMetadata = getMethodMetadata(instance, method);
      const paramsMetadata = getParamsMetadata(instance, method);
      const methodMiddlewaresMetadata = getMethodMiddlewaresMetadata(
        instance,
        method
      );
      if (!methodMetadata) continue;
      const methodChannel = methodMetadata.channel.trim();
      const channel = prefix ? `${prefix}:${methodChannel}` : methodChannel;
      const listener = (event, ...args) => __async(this, null, function* () {
        var _a, _b, _c, _d;
        const request = new Request2(args[0]).toPlainObject();
        const response = new Response2();
        const params = resolveParams(paramsMetadata, request, response, event);
        const methodMiddlewares = groupBy(
          methodMiddlewaresMetadata.middlewares,
          "type",
          (middleware) => container.resolve(middleware.token)
        );
        const controllerMiddlewares = groupBy(
          middlewares2,
          "middlewareType",
          (middleware) => middleware.middlewareInstance
        );
        const beforeMiddlewares = [
          ...(_a = controllerMiddlewares.Before) != null ? _a : [],
          ...(_b = methodMiddlewares.Before) != null ? _b : []
        ];
        try {
          const beforeMiddlewaresResult = yield applyBeforeMiddlewares(
            beforeMiddlewares,
            request,
            response,
            event
          );
          if (beforeMiddlewaresResult === false)
            return {
              headers: { success: "false" },
              payload: { error: "Before middlewares failed" }
            };
        } catch (error) {
          Logger.error(
            (_c = error.message) != null ? _c : "Unknown error",
            error.name
          );
          return {
            headers: { success: "false" },
            payload: { error: (_d = error.message) != null ? _d : error }
          };
        }
        const responseController = yield instance[method](...params);
        if (typeof responseController === "undefined")
          return response.toPlainObject();
        if (responseController instanceof Response2)
          return responseController.toPlainObject();
        return response.send(responseController).toPlainObject();
      });
      if (methodMetadata.type === "invoke") {
        import_electron.ipcMain.handle(channel, listener);
      } else if (methodMetadata.type === "send") {
        import_electron.ipcMain.on(channel, listener);
      }
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
  Headers,
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