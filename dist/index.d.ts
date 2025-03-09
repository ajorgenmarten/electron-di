declare const COLORS: {
    BACKGROUND: {
        LIGHT: {
            BLACK: string;
            RED: string;
            GREEN: string;
            YELLOW: string;
            BLUE: string;
            MAGENTA: string;
            CYAN: string;
            WHITE: string;
            DEFAULT: string;
        };
        DARK: {
            BLACK: string;
            RED: string;
            GREEN: string;
            YELLOW: string;
            BLUE: string;
            MAGENTA: string;
            CYAN: string;
            WHITE: string;
            DEFAULT: string;
        };
    };
    FOREGROUND: {
        LIGHT: {
            BLACK: string;
            RED: string;
            GREEN: string;
            YELLOW: string;
            BLUE: string;
            MAGENTA: string;
            CYAN: string;
            WHITE: string;
            DEFAULT: string;
        };
        DARK: {
            BLACK: string;
            RED: string;
            GREEN: string;
            YELLOW: string;
            BLUE: string;
            MAGENTA: string;
            CYAN: string;
            WHITE: string;
            DEFAULT: string;
        };
    };
};
type ColorFor = keyof typeof COLORS;
type ColorType = keyof (typeof COLORS)[ColorFor];
type ColorValue = keyof (typeof COLORS)[ColorFor][ColorType];
interface ThemeProps {
    font?: {
        colorType: ColorType;
        colorValue: ColorValue;
    };
    background?: {
        colorType: ColorType;
        colorValue: ColorValue;
    };
}
interface CustomLoggerProps {
    title: ThemeProps;
    message: ThemeProps;
}
declare class Logger {
    static log(message: string, title?: string, ...args: any[]): void;
    static info(message: string, title?: string, ...args: any[]): void;
    static success(message: string, title?: string, ...args: any[]): void;
    static error(message: string, title?: string, ...args: any[]): void;
    static warn(message: string, title?: string, ...args: any[]): void;
    static customLogger(options: CustomLoggerProps): (message: string, title?: string, ...args: any[]) => void;
}

type Class<T = any> = new (...args: any[]) => T;
type AbstractClass<T = any> = abstract new (...args: any[]) => T;
type Token<T = any> = Class<T> | AbstractClass<T>;
type Headers$1 = Record<string, string>;
type Payload$1<T = any> = T;
interface IRequest<T = any> {
  headers?: Headers$1;
  payload?: Payload$1<T>;
}
interface IResponse<T = any> {
  get Payload(): Payload$1<T> | undefined;
  get Headers(): Headers$1;
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
type IMiddleware<T = "Before" | "After"> = {
  excecute(...args: any[]): MiddlewareReturnType<T>;
};

declare function After(token: Token): (target: any, propertyKey?: string | undefined, _propertyDescriptor?: PropertyDescriptor) => void;

declare function Before(token: Token): (target: any, propertyKey?: string | undefined, _propertyDescriptor?: PropertyDescriptor) => void;

declare function Payload(): (target: any, propertyKey: string, paramIndex: number) => void;

declare function Controller(prefix?: string): (target: any) => void;

declare function Global(): (target: Class) => void;

declare function Headers(key?: string): (target: any, propertyKey: string, paramIndex: number) => void;

declare function Inject(token: Token): (target: any, propertyKey: string | undefined, paramIndex: number) => void;

declare function Injectable(): (target: Class) => void;

declare function IPCEvent(): (target: any, propertyKey: string, paramIndex: number) => void;

type IProvider = { provide: Token; useClass: Class } | Class;

interface ModuleOptions {
  providers?: IProvider[];
  controllers?: Class[];
  imports?: Class[];
  exports?: Token[];
}

declare function Module(options: ModuleOptions): (target: Class) => void;

declare function OnInvoke(channel: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;

declare function OnSend(channel: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;

declare function Request(): (target: any, propertyKey: string, paramIndex: number) => void;

declare function Response(): (target: any, propertyKey: string, paramIndex: number) => void;

declare function Bootstrap(module: Class): void;

export { After, Before, Bootstrap, Controller, Global, Headers, type IMiddleware, IPCEvent, type IRequest, type IResponse, Inject, Injectable, Logger, Module, OnInvoke, OnSend, Payload, Request, Response };
