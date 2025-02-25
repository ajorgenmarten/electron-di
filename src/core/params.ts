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

  toPlainObject() {
    return {
      headers: { ...this.headers },
      payload: this.payload ? this.payload : undefined,
    };
  }
}

export class Response<T = any> {
  private headers: Record<string, string> = {};
  private payload: any | undefined = undefined;
  header(key: string, value: string | number | boolean | undefined) {
    if (typeof value === "undefined") delete this.headers[key];
    else this.headers[key] = value.toString();
    return this;
  }
  send(payload: T) {
    this.payload = payload;
  }
  get Payload() {
    return this.payload;
  }
}
