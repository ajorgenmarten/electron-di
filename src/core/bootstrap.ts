import { ipcMain, IpcMainEvent, IpcMainInvokeEvent } from "electron";
import symbols from "./constants";
import { Container } from "./container";
import { IController } from "../types/container.types";
import { Class, IMiddleware, IRequest } from "../types/general.types";
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

export function Bootstrap(module: Class) {
  const container = new Container();
  container.registerModule(module);

  const getControllerMiddlewaresInfo = (controller: IController) => {
    return controller.Middlewares.map((middlewareMetadata) => {
      const middlewareInstance = container.resolve(middlewareMetadata.Token);
      const middlewareType = middlewareMetadata.Type;
      return { middlewareInstance, middlewareType };
    });
  };

  const getControllersInfo = (container: Container) => {
    return container.Modules.map((module) => module.Controllers)
      .flat()
      .map((controller) => {
        const instance = container.resolve(controller.Token);
        const prefix = controller.Prefix.trim();
        const middlewares = getControllerMiddlewaresInfo(controller);
        return { instance, prefix, middlewares };
      });
  };

  const getMethodNamesFromInstance = (instance: InstanceType<Class>) => {
    const prototype = Object.getPrototypeOf(instance);
    return Object.getOwnPropertyNames(prototype).filter((methodName) => {
      return (
        typeof prototype[methodName] === "function" &&
        methodName !== "constructor"
      );
    });
  };

  const getMethodMetadata = (instance: InstanceType<Class>, method: string) => {
    const methodMetadata: IPCMethodMetadata = Reflect.getMetadata(
      symbols.ipcmethod,
      instance,
      method
    );
    return methodMetadata;
  };

  const getParamsMetadata = (instance: InstanceType<Class>, method: string) => {
    const paramsMetadata: ParamsMetadata = Reflect.getMetadata(
      symbols.paramsArg,
      instance,
      method
    ) ?? { params: [] };
    return paramsMetadata;
  };

  const getMethodMiddlewaresMetadata = (
    instance: InstanceType<Class>,
    method: string
  ) => {
    const middlewaresMetadata: MiddlewareMetadata = Reflect.getMetadata(
      symbols.middlewares,
      instance,
      method
    ) ?? { middlewares: [] };
    return middlewaresMetadata;
  };

  const resolveParams = (
    { params }: ParamsMetadata,
    request: IRequest,
    response: ElectronDIResponse,
    event: IpcMainInvokeEvent | IpcMainEvent
  ) => {
    return params.map((param) => {
      if (param.type === "IpcEvent") return event;
      if (param.type === "Request") return request;
      if (param.type === "Headers") return request.headers;
      if (param.type === "Payload") return request.payload;
      if (param.type === "Response") return response;
      return undefined;
    });
  };

  const groupBy = <T, M>(array: T[], key: keyof T, mapper?: (item: T) => M) => {
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
  };

  const applyBeforeMiddlewares = async (
    middlewares: IMiddleware<"Before">[],
    request: IRequest,
    response: ElectronDIResponse,
    event: IpcMainInvokeEvent | IpcMainEvent
  ) => {
    for (const middleware of middlewares) {
      const middlewareParamsMetadata: ParamsMetadata = Reflect.getMetadata(
        symbols.paramsArg,
        middleware,
        "excecute"
      );
      const middlewareParams = resolveParams(
        middlewareParamsMetadata,
        request,
        response,
        event
      );
      const res = await middleware.excecute(...middlewareParams);
      if (res === false) return false;
    }
    return true;
  };

  const controllersInfo = getControllersInfo(container);

  for (const { instance, prefix, middlewares } of controllersInfo) {
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

      const listener = async (
        event: IpcMainInvokeEvent | IpcMainEvent,
        ...args: any[]
      ): Promise<IRequest> => {
        const request = new ElectronDIRequest(args[0]).toPlainObject();
        const response = new ElectronDIResponse();
        const params = resolveParams(paramsMetadata, request, response, event);
        const methodMiddlewares = groupBy(
          methodMiddlewaresMetadata.middlewares,
          "type",
          (middleware) => container.resolve(middleware.token)
        );
        const controllerMiddlewares = groupBy(
          middlewares,
          "middlewareType",
          (middleware) => middleware.middlewareInstance
        );
        const beforeMiddlewares = [
          ...(controllerMiddlewares.Before ?? []),
          ...(methodMiddlewares.Before ?? []),
        ];
        try {
          const beforeMiddlewaresResult = await applyBeforeMiddlewares(
            beforeMiddlewares,
            request,
            response,
            event
          );
          if (beforeMiddlewaresResult === false)
            return {
              headers: { success: "false" },
              payload: { error: "Before middlewares failed" },
            };
        } catch (error) {
          Logger.error(
            (error as Error).message ?? "Unknown error",
            (error as Error).name
          );
          return {
            headers: { success: "false" },
            payload: { error: (error as Error).message ?? error },
          };
        }
        const responseController = await instance[method](...params);
        if (typeof responseController === "undefined")
          return response.toPlainObject();
        if (responseController instanceof ElectronDIResponse)
          return responseController.toPlainObject();
        return response.send(responseController).toPlainObject();
      };

      if (methodMetadata.type === "invoke") {
        ipcMain.handle(channel, listener);
      } else if (methodMetadata.type === "send") {
        ipcMain.on(channel, listener);
      }
    }
  }
}
