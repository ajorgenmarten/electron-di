import {
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  IpcMainInvokeEvent,
} from "electron";
import symbols from "./constants";
import { Container } from "./container";
import {
  Class,
  IIPCErrorConstructorParam,
  IMiddleware,
  IMiddlewareContext,
} from "../types/general.types";
import { Logger } from "./logger";
import {
  IPCMethodMetadata,
  MiddlewareMetadata,
  ParamsMetadata,
} from "../types/metadata.types";
import {
  Request as ElectronDIRequest,
  Response as ElectronDIResponse,
} from "./params";

class IPCError extends Error {
  details: any;
  constructor(data: IIPCErrorConstructorParam) {
    super(data.message);
    this.details = data.details;
  }
}

class MetadataManager {
  static getMethodMetadata(
    instance: InstanceType<Class>,
    method: string
  ): IPCMethodMetadata {
    return Reflect.getMetadata(symbols.ipcmethod, instance, method);
  }

  static getParamsMetadata(
    instance: InstanceType<Class>,
    method: string
  ): ParamsMetadata {
    return (
      Reflect.getMetadata(symbols.paramsArg, instance, method) ?? { params: [] }
    );
  }

  static getMethodMiddlewaresMetadata(
    instance: InstanceType<Class>,
    method: string
  ): MiddlewareMetadata {
    return (
      Reflect.getMetadata(symbols.middlewares, instance, method) ?? {
        middlewares: [],
      }
    );
  }
}

class MiddlewareHandler {
  static async executeBeforeMiddlewares(
    middlewares: IMiddleware<"Before">[],
    context: IMiddlewareContext
  ) {
    if (!middlewares || !Array.isArray(middlewares)) {
      const message = "Middlewares Before no es un array válido";
      Logger.warn(message);
      return { success: false, reason: message };
    }
    for (const middleware of middlewares) {
      const params = this.resolveMiddlewareParams(middleware, context);
      const result = await middleware.execute(...params);
      if (!result)
        return {
          success: false,
          reason: `Middleware ${middleware.constructor.name} ha retornado "false".`,
        };
    }
    return { success: true };
  }

  static async executeAfterMiddlewares(
    middlewares: IMiddleware<"After">[],
    context: IMiddlewareContext
  ): Promise<void> {
    const promises = middlewares.map((middleware) => {
      const params = this.resolveMiddlewareParams(middleware, context);
      return middleware.execute(...params);
    });
    await Promise.all(promises);
  }

  private static resolveMiddlewareParams(
    middleware: IMiddleware<any>,
    context: IMiddlewareContext
  ): any[] {
    const metadata = MetadataManager.getParamsMetadata(middleware, "execute");
    return ParamsResolver.resolveParams(metadata, context);
  }
}

class ParamsResolver {
  static resolveParams(
    { params }: ParamsMetadata,
    context: IMiddlewareContext
  ): any[] {
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
        case "MainWindow":
          return context.mainWindow;
        default:
          return undefined;
      }
    });
  }
}

class IPCHandler {
  private static handleError(error: unknown) {
    if (error instanceof IPCError) {
      return {
        success: false,
        reason: error.message,
        details: error.details,
      };
    }
    Logger.error((error as Error).message || "Internal Error", "ELECTRON DI");
    return {
      success: false,
      reason: "Internal Error",
      details: error,
    };
  }
  private static async handleRequest(
    instance: InstanceType<Class>,
    method: string,
    context: IMiddlewareContext,
    middlewares: {
      before: IMiddleware<"Before">[];
      after: IMiddleware<"After">[];
    }
  ): Promise<any> {
    try {
      const beforeResult = await MiddlewareHandler.executeBeforeMiddlewares(
        middlewares.before,
        context
      );
      if (!beforeResult.success) {
        Logger.error(beforeResult.reason ?? "Un middleware no se ha cumplido");
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
      const result = await instance[method](...params);
      const response = this.formatResponse(result, context.response);

      MiddlewareHandler.executeAfterMiddlewares(
        middlewares.after,
        context
      ).catch((error) => {
        Logger.error(error.message, "ELECTRON DI");
      });

      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private static formatResponse(result: any, response: ElectronDIResponse) {
    if (typeof result === "undefined" && typeof response.Data === "undefined")
      return undefined;
    if (typeof result === "undefined" && typeof response.Data !== "undefined")
      return response.Data;
    response.Data = result;
    return response.Data;
  }

  static registerHandler(
    channel: string,
    instance: InstanceType<Class>,
    method: string,
    type: "invoke" | "send",
    middlewares: {
      before: IMiddleware<"Before">[];
      after: IMiddleware<"After">[];
    },
    mainWindow?: BrowserWindow
  ): void {
    if (!channel || typeof channel !== "string") {
      throw new Error("El channel debe ser un string válido");
    }

    if (ipcMain.listeners(channel).length > 0) {
      Logger.warn(
        `Ya existe un handler registrado para el channel: ${channel}`
      );
      return;
    }

    const handler = async (
      event: IpcMainInvokeEvent | IpcMainEvent,
      ...args: any[]
    ): Promise<Request> => {
      const context: IMiddlewareContext = {
        request: new ElectronDIRequest(event, args[0]),
        response: new ElectronDIResponse(),
        mainWindow,
      };

      return this.handleRequest(instance, method, context, middlewares);
    };

    type === "invoke"
      ? ipcMain.handle(channel, handler)
      : ipcMain.on(channel, handler);
  }
}

/**
 * Inicializa la aplicación Electron con el módulo principal.
 * Registra todos los controladores y middlewares definidos en el módulo.
 *
 * @param module - El módulo principal de la aplicación
 * @throws {Error} Si el módulo no está correctamente configurado
 *
 * @example
 * Bootstrap(AppModule);
 */
export function Bootstrap(module: Class, mainWindow?: BrowserWindow): void {
  const container = new Container();
  container.registerModule(module);

  const controllers = container.Modules.flatMap(
    (module) => module.Controllers
  ).map((controller) => ({
    instance: container.resolve(controller.Token),
    prefix: controller.Prefix.trim(),
    middlewares: controller.Middlewares.map((m) => ({
      instance: container.resolve(m.Token),
      type: m.Type,
    })),
  }));

  for (const controller of controllers) {
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(controller.instance)
    ).filter(
      (name) =>
        name !== "constructor" &&
        typeof controller.instance[name] === "function"
    );

    for (const method of methods) {
      const metadata = MetadataManager.getMethodMetadata(
        controller.instance,
        method
      );
      if (!metadata) continue;

      const channel = controller.prefix
        ? `${controller.prefix}:${metadata.channel.trim()}`
        : metadata.channel.trim();

      const methodMiddlewares = MetadataManager.getMethodMiddlewaresMetadata(
        controller.instance,
        method
      ).middlewares;

      const middlewares = {
        before: [
          ...controller.middlewares
            .filter((m) => m.type === "Before")
            .map((m) => m.instance),
          ...methodMiddlewares
            .filter((m) => m.type === "Before")
            .map((m) => container.resolve(m.token)),
        ].reverse(),
        after: [
          ...controller.middlewares
            .filter((m) => m.type === "After")
            .map((m) => m.instance),
          ...methodMiddlewares
            .filter((m) => m.type === "After")
            .map((m) => container.resolve(m.token)),
        ].reverse(),
      };

      IPCHandler.registerHandler(
        channel,
        controller.instance,
        method,
        metadata.type,
        middlewares,
        mainWindow
      );
    }
  }
}
