export type Class<T = any> = new (...args: any[]) => T;
export type AbstractClass<T = any> = abstract new (...args: any[]) => T;
export type Token<T = any> = Class<T> | AbstractClass<T>;
