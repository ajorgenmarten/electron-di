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
var INJECT_CONSTRUCTOR = Symbol("inject:metadata");
var DEFINE_PREFIX_CONTROLLER = Symbol("controller:metadata");
var DEFINE_MODULE_OPTIONS = Symbol("module:metadata");
var DEFINE_ELECTRON_METADATA = Symbol("electron:metadata");

// src/container.ts
var DependencyInjector = class {
  constructor() {
    this.container = /* @__PURE__ */ new Map();
  }
  register(token, cls) {
    if (this.container.has(token)) return;
    this.container.set(token, cls);
  }
  resolveDepenedency(token) {
    if (!this.container.has(token))
      throw new Error(`Dependency for [${token}] not found.`);
    const cls = this.container.get(token);
    if (!cls) throw new Error(`Dependency [${token}] not found`);
    const clsInjectMetadata = Reflect.getMetadata(INJECT_CONSTRUCTOR, cls);
    if (!clsInjectMetadata) return new cls();
    const instances = clsInjectMetadata.constructParams.map((cls2) => this.resolveDepenedency(cls2.name));
    return new cls(...instances);
  }
  updateToken(token, cls) {
    if (!this.container.has(cls.name))
      throw new Error(`Dependecy [${cls.name}] has been not injected. Use ''@Injectable()'' decorator in class ''${cls.name}''`);
    this.container.delete(cls.name);
    this.container.set(token, cls);
  }
  get Container() {
    return this.container;
  }
};
var container = new DependencyInjector();

// src/decorators.ts
function Inject(token) {
  return function(target, _propertyKey, paramIndex) {
    let metadata = Reflect.getMetadata(INJECT_CONSTRUCTOR, target);
    if (!metadata) metadata = { constructParams: [] };
    metadata.constructParams[paramIndex] = token;
    Reflect.defineMetadata(INJECT_CONSTRUCTOR, metadata, target);
  };
}
function Injectable() {
  return function(target) {
    container.register(target.name, target);
  };
}
function Controller(prefix) {
  return function(target) {
    const metadata = { prefix };
    Reflect.defineMetadata(DEFINE_PREFIX_CONTROLLER, metadata, target);
    container.register(target.name, target);
  };
}
function OnInvoke(channel) {
  return function(target, propertyKey) {
    let metadata = Reflect.getMetadata(DEFINE_ELECTRON_METADATA, target);
    const decorate = { channel, method: propertyKey, type: "invoke" };
    if (metadata) metadata.decorates.push(decorate);
    else metadata = { decorates: [decorate] };
    Reflect.defineMetadata(DEFINE_ELECTRON_METADATA, metadata, target);
  };
}
function OnSend(channel) {
  return function(target, propertyKey) {
    let metadata = Reflect.getMetadata(DEFINE_ELECTRON_METADATA, target);
    const decorate = { channel, method: propertyKey, type: "send" };
    if (metadata) metadata.decorates.push(decorate);
    else metadata = { decorates: [decorate] };
    Reflect.defineMetadata(DEFINE_ELECTRON_METADATA, metadata, target);
  };
}
function Module(options) {
  return function(target) {
    Reflect.defineMetadata(DEFINE_MODULE_OPTIONS, options, target);
  };
}

// src/bootstrap.ts
import { ipcMain } from "electron";
function Bootstrap(...modules) {
  for (const module of modules) {
    const { providers, controllers } = Reflect.getMetadata(DEFINE_MODULE_OPTIONS, module);
    providers == null ? void 0 : providers.forEach(function(provider) {
      if (typeof provider === "function") return;
      container.updateToken(provider.provide.name, provider.useClass);
    });
    controllers == null ? void 0 : controllers.forEach(function(controller) {
      const { prefix } = Reflect.getMetadata(DEFINE_PREFIX_CONTROLLER, controller);
      const { decorates } = Reflect.getMetadata(DEFINE_ELECTRON_METADATA, controller.prototype);
      const resolved = container.resolveDepenedency(controller.name);
      for (const decorate of decorates) {
        const channel = prefix ? `${prefix}:${decorate.channel}` : decorate.channel;
        const handler = resolved[decorate.method];
        const newFunc = handler.bind(resolved);
        if (decorate.type === "invoke")
          ipcMain.handle(channel, function(event, ...args) {
            return __async(this, null, function* () {
              const returnValue = yield newFunc(event, ...args);
              return returnValue;
            });
          });
        if (decorate.type === "send")
          ipcMain.on(channel, function(event, ...args) {
            return __async(this, null, function* () {
              yield newFunc(event, ...args);
            });
          });
      }
    });
  }
}
export {
  Bootstrap,
  Controller,
  Inject,
  Injectable,
  Module,
  OnInvoke,
  OnSend,
  container
};
//# sourceMappingURL=index.mjs.map