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

declare class ModuleContainer {
    private readonly instances;
    private readonly providers;
    registerDependency(provider: IClass | IProvider): void;
    resolveDependency(token: string | IAbstractClass | IClass): any;
}
declare class DependencyInjector {
    private readonly container;
    registerModule(classModule: IClass): void;
    resolveDependency(classModule: IClass, token: string | IClass | IAbstractClass): any;
    get Container(): Map<string, ModuleContainer>;
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
