import { Class } from "./general.types";
import symbols from "./constants";
import { Container } from "./container";
import {
  IPCMethodMetadata,
  ItemParamMetadata,
  MiddlewareMetadata,
  ParamsMetadata,
} from "./metadata.types";
import { ipcMain, IpcMainEvent, IpcMainInvokeEvent } from "electron";
import {
  Request as ElectronDIRequest,
  Response as ElectronDIResponse,
} from "./params";

function getMethodsNamesOfInstance<T>(instance: InstanceType<Class<T>>) {
  const prototype = Object.getPrototypeOf(instance);
  const methods = Object.getOwnPropertyNames(prototype).filter((methodName) => {
    return (
      typeof prototype[methodName] === "function" &&
      methodName !== "constructor"
    );
  });
  return methods;
}

function groupBy<T, M>(array: T[], key: keyof T, mapper?: (item: T) => M) {
  const resultRecord: Record<string, (T | M)[]> = {};
  for (const item of array) {
    const value = item[key];
    if ((value as string) in resultRecord) {
      resultRecord[value as string].push(
        typeof mapper === "function" ? mapper(item) : item
      );
    } else {
      resultRecord[value as string] = [
        typeof mapper === "function" ? mapper(item) : item,
      ];
    }
  }
  return resultRecord;
}

export function Bootstrap(module: Class) {
  const container = new Container();
  container.registerModule(module);
  const controllers = container.Modules.map((module) => module.Controllers)
    .flat()
    .map((controller) => {
      const controllerInstance = container.resolve(controller.Token);
      const controllerPrefix = controller.Prefix.trim();
      const controllerMiddlewares = controller.Middlewares.map((middleware) => {
        const middlewareInstance = container.resolve(middleware.Token);
        const middlewareType = middleware.Type;
        return { middlewareInstance, middlewareType };
      });
      return { controllerInstance, controllerMiddlewares, controllerPrefix };
    });
  for (const controller of controllers) {
    const { controllerInstance, controllerPrefix, controllerMiddlewares } =
      controller;
    const methods = getMethodsNamesOfInstance(controllerInstance);
    for (const method of methods) {
      const ipcMethodMetadata: IPCMethodMetadata = Reflect.getMetadata(
        symbols.ipcmethod,
        controllerInstance,
        method
      );
      const paramsArgsMetadata: ParamsMetadata = Reflect.getMetadata(
        symbols.paramsArg,
        controllerInstance,
        method
      ) ?? { params: [] };
      const middlewareMethods: MiddlewareMetadata = Reflect.getMetadata(
        symbols.middlewares,
        controllerInstance,
        method
      ) ?? { middlewares: [] };
      if (!ipcMethodMetadata) continue;
      const methodChannel = ipcMethodMetadata.channel.trim();
      const channel = controllerPrefix
        ? `${controllerPrefix}:${methodChannel}`
        : methodChannel;
      const listener = async (
        event: IpcMainInvokeEvent | IpcMainEvent,
        ...args: any[]
      ) => {
        const request = new ElectronDIRequest(args[0]).toPlainObject();
        const resposne = new ElectronDIResponse();
        const resolveParams = (param: ItemParamMetadata) => {
          if (param.type === "IpcEvent") {
            return event;
          }
          if (param.type === "Request") {
            return request;
          }
          if (param.type === "Headers") {
            return request.headers;
          }
          if (param.type === "Payload") {
            return request.payload;
          }
          if (param.type === "Response") {
            return resposne;
          }
          return undefined;
        };
        const methodParams = paramsArgsMetadata.params.map(resolveParams);
        const classMiddlewares = groupBy(
          controllerMiddlewares,
          "middlewareType",
          (middleware) => middleware.middlewareInstance
        );
        const methodMiddlewares = groupBy(
          middlewareMethods.middlewares,
          "type",
          (middleware) => container.resolve(middleware.token)
        );
        const afterMiddlewares = [
          ...(classMiddlewares.After ?? []),
          ...(methodMiddlewares.After ?? []),
        ];
        const beforeMiddlewares = [
          ...(classMiddlewares.Before ?? []),
          ...(methodMiddlewares.Before ?? []),
        ];
        for (const afterMiddleware of afterMiddlewares) {
          const middlewareParamsMetadata: ParamsMetadata = Reflect.getMetadata(
            symbols.paramsArg,
            afterMiddleware,
            "excecute"
          ) ?? { params: [] };
          const middlewareParams =
            middlewareParamsMetadata.params.map(resolveParams);
          console.log(middlewareParams);
          const response = await afterMiddleware.excecute(...middlewareParams);
          if (response === true) console.log("middleware passed");
        }
        controllerInstance[method](...methodParams);
      };
      if (ipcMethodMetadata.type === "invoke") {
        ipcMain.handle(channel, listener);
      } else if (ipcMethodMetadata.type === "send") {
        ipcMain.on(channel, listener);
      }
    }
  }
}
