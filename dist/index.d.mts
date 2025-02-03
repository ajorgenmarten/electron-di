interface IClass {
    new (...args: any[]): any;
}
type IAbstractClass = abstract new (...args: any[]) => any;
interface IModuleOptions {
    providers?: (IClass | IProvider)[];
    controllers?: IClass[];
}
interface IProvider {
    provide: IAbstractClass | IClass;
    useClass: IClass;
}

declare class DependencyInjector {
    private readonly container;
    register(token: string, cls: IClass): void;
    resolveDepenedency(token: string): any;
    updateToken(token: string, cls: IClass): void;
    get Container(): Map<string, IClass>;
}
declare const container: DependencyInjector;

declare function Inject(token: IClass | IAbstractClass): (target: IClass, _propertyKey: string | undefined, paramIndex: number) => void;
declare function Injectable(): (target: IClass) => void;
declare function Controller(prefix?: string): (target: IClass) => void;
declare function OnInvoke(channel: string): (target: any, propertyKey: string) => void;
declare function OnSend(channel: string): (target: any, propertyKey: string) => void;
declare function Module(options: IModuleOptions): (target: IClass) => void;

declare function Bootstrap(...modules: IClass[]): void;

export { Bootstrap, Controller, Inject, Injectable, Module, OnInvoke, OnSend, container };
