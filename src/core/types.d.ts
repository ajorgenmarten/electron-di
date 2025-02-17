export type Class = new (...args: any[]) => any;
export type AbstractClass = new (...args: any[]) => any;
export type Token = Class | AbstractClass;
