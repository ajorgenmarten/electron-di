var __defProp = Object.defineProperty;
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
import "reflect-metadata";

// src/constants.ts
var CLASS_METADATA_KEY = Symbol("electron:classmetadata");

// src/utils.ts
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
  static log(message, title = "ELECTRON DI") {
    console.log(`${THEMES.log}:	${message}`, title);
  }
  static info(message, title) {
    console.log(`${THEMES.info}:	${message}`, title);
  }
  static success(message, title) {
    console.log(`${THEMES.success}:	${message}`, title);
  }
  static error(message, title) {
    console.log(`${THEMES.error}:	${message}`, title);
  }
  static warn(message, title) {
    console.log(`${THEMES.warn}:	${message}`, title);
  }
  static customLogger(options) {
    const titleTheme = genTheme(options.title);
    const messageTheme = genTheme(options.message);
    return function(message, title, ...args) {
      console.log(`${titleTheme}:	${messageTheme}`, message, title, ...args);
    };
  }
};
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
    Logger.success(`module: [${classModule.name}] registered.`, "ELECTRON DI");
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
  return function(target, propertyKey, descriptor) {
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
function Middleware(token) {
  return function(target, propertyKey) {
    let metadata = Reflect.getMetadata(CLASS_METADATA_KEY, target);
    if (metadata == void 0) {
      metadata = { type: "controller", middleware: [] };
    }
    if (!Array.isArray(metadata.middleware)) {
      metadata.middleware = [];
    }
    if (propertyKey === void 0)
      metadata.middleware.push(token);
    else
      metadata.middleware.push({ method: propertyKey, token });
    Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target);
  };
}
function Module(options) {
  return function(target) {
    const setMetadata = { type: "module", options };
    Reflect.defineMetadata(CLASS_METADATA_KEY, setMetadata, target);
  };
}

// src/bootstrap.ts
import { ipcMain } from "electron";
function Bootstrap(...modules) {
  var _a;
  for (const module of modules) {
    const { options } = Reflect.getMetadata(CLASS_METADATA_KEY, module);
    container.registerModule(module);
    (_a = options == null ? void 0 : options.controllers) == null ? void 0 : _a.forEach(function(controller) {
      const { type, prefix, middleware: classMiddlewares } = Reflect.getMetadata(CLASS_METADATA_KEY, controller);
      if (type !== "controller") throw new ElectronDIError(`Decorate class "${controller.name}" with @Controller`);
      const resolved = container.resolveDependency(module, controller);
      const { decorates, middleware: methodMiddlewares } = Reflect.getMetadata(CLASS_METADATA_KEY, resolved);
      decorates == null ? void 0 : decorates.forEach(function(value) {
        const channel = prefix ? `${prefix}:${value.channel}` : value.channel;
        const method = resolved[value.method];
        const handler = method.bind(resolved);
        const middlewares = methodMiddlewares == null ? void 0 : methodMiddlewares.filter(function(m) {
          return m.method === value.method;
        });
        function excecuteClassMiddlewares(event, ...args) {
          return __async(this, null, function* () {
            if (!Array.isArray(classMiddlewares)) return true;
            for (const middleware of classMiddlewares) {
              const middlewareHandler = container.resolveDependency(module, middleware);
              const result = yield middlewareHandler.execute(event, ...args);
              if (result === false) return false;
            }
            return true;
          });
        }
        function excecuteMethodMiddlewares(event, ...args) {
          return __async(this, null, function* () {
            if (!Array.isArray(middlewares)) return true;
            for (const middleware of middlewares) {
              const middlewareHandler = container.resolveDependency(module, middleware.token);
              const result = yield middlewareHandler.execute(event, ...args);
              if (result === false) return false;
            }
            return true;
          });
        }
        function excecuteMiddlewares(event, ...args) {
          return __async(this, null, function* () {
            const classMiddlewaresResult = yield excecuteClassMiddlewares(event, ...args);
            if (classMiddlewaresResult === false) return false;
            const methodMiddlewaresResult = yield excecuteMethodMiddlewares(event, ...args);
            if (methodMiddlewaresResult === false) return false;
            return true;
          });
        }
        if (value.type === "invoke") {
          ipcMain.handle(channel, function(event, ...args) {
            return __async(this, null, function* () {
              const result = yield excecuteMiddlewares(event, ...args);
              if (result === false) return;
              const returnValue = yield handler(event, ...args);
              return returnValue;
            });
          });
        }
        if (value.type === "send") {
          ipcMain.on(channel, function(event, ...args) {
            return __async(this, null, function* () {
              const result = yield excecuteMiddlewares(event, ...args);
              if (result === false) return;
              yield handler(event, ...args);
            });
          });
        }
        Logger.info(`type: [${value.type}] channel: [${channel}] controller: [${controller.name}] method: [${value.method}]`, "IPC Listener");
      });
    });
  }
}

// src/types.ts
var CanActivate = class {
};
export {
  Bootstrap,
  CanActivate,
  Controller,
  Inject,
  Injectable,
  Logger,
  Middleware,
  Module,
  OnInvoke,
  OnSend,
  container
};
//# sourceMappingURL=index.mjs.map