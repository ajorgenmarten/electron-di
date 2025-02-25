export type Class<T = any> = new (...args: any[]) => T;
export type AbstractClass<T = any> = abstract new (...args: any[]) => T;
export type Token<T = any> = Class<T> | AbstractClass<T>;
export type Headers = Record<string, string>;
export type Payload<T = any> = T;
export interface IRequest<T = any> {
  headers?: Headers;
  payload?: Payload<T>;
}
type MiddlewareReturnType<T = "Before" | "After"> = T extends "After"
  ? Promise<void> | void
  : Promise<boolean> | boolean;
export type MiddlewareFunction<T> = (args: any[]) => MiddlewareReturnType<T>;
export type IMiddleware<T = "Before" | "After"> = {
  excecute(...args: any[]): MiddlewareReturnType<T>;
};
