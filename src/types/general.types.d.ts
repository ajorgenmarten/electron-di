export type Class<T = any> = new (...args: any[]) => T;
export type AbstractClass<T = any> = abstract new (...args: any[]) => T;
export type Token<T = any> = Class<T> | AbstractClass<T>;
export type Headers = Record<string, string>;
export type Payload<T = any> = T;
export interface IRequest<T = any> {
  headers?: Headers;
  payload?: Payload<T>;
}
export interface IResponse<T = any> {
  get Payload(): Payload<T> | undefined;
  get Headers(): Headers;
  /**
   * Función para agregar o modificar una cabecera de la respuesta
   * @param key clave de la cabecera que se va a agregar, modificar o eliminar
   * @param value valor de la clave de la cebecera, si es undefined se elimina la cabecera
   * @returns {Response} la misma instancia de la clase Response
   */
  header(
    key: string,
    value: string | number | boolean | undefined
  ): IResponse<T>;
  /**
   * Función para establecer el payload de la respuesta
   * @param payload Estable el payload de la respuesta
   * @returns
   */
  send(payload: T): IRespnse<T>;
}
type MiddlewareReturnType<T = "Before" | "After"> = T extends "After"
  ? Promise<void> | void
  : Promise<boolean> | boolean;
export type MiddlewareFunction<T> = (args: any[]) => MiddlewareReturnType<T>;
export type IMiddleware<T = "Before" | "After"> = {
  excecute(...args: any[]): MiddlewareReturnType<T>;
};
