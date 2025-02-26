import { IRequest, IResponse } from "./general.types";

/**
 * Representa un objeto que contiene los datos que se envian a través de un método IPC, se usa para validar que el formato de los datos sea correcto
 */
export class Request<T = any> {
  private headers: Record<string, string> = {};
  private payload: T | undefined = undefined;
  constructor(argument?: any) {
    this.headers = this.validateHeaders(argument?.headers);
    this.payload = argument?.payload;
  }

  private validateHeaders(headers?: any) {
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

  toPlainObject(): IRequest {
    return {
      headers: { ...this.headers },
      payload: this.payload ? this.payload : undefined,
    };
  }
}

export class Response<T = any> implements IResponse<T> {
  private headers: Record<string, string> = {};
  private payload: any | undefined = undefined;
  /**
   * Función para agregar o modificar una cabecera de la respuesta
   * @param key clave de la cabecera que se va a agregar, modificar o eliminar
   * @param value valor de la clave de la cebecera, si es undefined se elimina la cabecera
   * @returns {Response} la misma instancia de la clase Response
   */
  header(key: string, value: string | number | boolean | undefined) {
    if (typeof value === "undefined") delete this.headers[key];
    else this.headers[key] = value.toString();
    return this;
  }
  /**
   * Función para establecer el payload de la respuesta
   * @param payload Estable el payload de la respuesta
   * @returns
   */
  send(payload: T) {
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
      headers: { ...this.headers },
      payload: this.payload ? this.payload : undefined,
    };
  }
}
