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
type ColorType = keyof typeof COLORS[ColorFor];
type ColorValue = keyof typeof COLORS[ColorFor][ColorType];
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

declare function After(token: Token): (target: any, propertyKey?: string | undefined, _propertyDescriptor?: PropertyDescriptor) => void;

declare function Before(token: Token): (target: any, propertyKey?: string | undefined, _propertyDescriptor?: PropertyDescriptor) => void;

declare function Body(key?: string): (target: any, propertyKey: string, paramIndex: number) => void;

declare function Controller(prefix?: string): (target: any) => void;

declare function Global(): (target: Class) => void;

declare function Injectable(): (target: Class) => void;

type IProvider = { provide: Token; useClass: Class } | Class;

interface ModuleOptions {
  providers?: IProvider[];
  controllers?: Class[];
  imports?: Class[];
  exports?: Token[];
}

declare function Module(options: ModuleOptions): (target: Class) => void;

declare function Headers(key?: string): (target: any, propertyKey: string, paramIndex: number) => void;

declare function IPCEvent(key?: string): (target: any, propertyKey: string, paramIndex: number) => void;

declare function Request(key?: string): (target: any, propertyKey: string, paramIndex: number) => void;

declare function Inject(token: Token): (target: any, propertyKey: string | undefined, paramIndex: number) => void;

declare function OnSend(channel: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;

declare function OnInvoke(channel: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;

declare function Bootstrap(module: Class): void;

export { After, Before, Body, Bootstrap, Controller, Global, Headers, IPCEvent, Inject, Injectable, Logger, Module, OnInvoke, OnSend, Request };
