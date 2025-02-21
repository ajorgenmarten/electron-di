export type Class = new (...args: any[]) => any;
export type AbstractClass = abstract new (...args: any[]) => any;
export type Token = Class | AbstractClass;
