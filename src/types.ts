/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IClass {
  new (...args: any[]): any;
}
export type IAbstractClass = abstract new (...args: any[]) => any;
export interface IModuleOptions {
  providers?: (IClass | IProvider)[];
  controllers?: IClass[];
}
export interface IProvider {
  provide: IAbstractClass | IClass;
  useClass: IClass;
}
export interface IElectronMetadataItem {
  type: "invoke" | "send";
  channel: string;
  method: string;
}

export interface IDecorateMetadata {
    type: "provider" | "controller" | "module";
    prefix?: string;
    decorates?: IElectronMetadataItem[];
    dependencies?: (IClass | IAbstractClass)[];
    options?: IModuleOptions;
}