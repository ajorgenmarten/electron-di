/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IClass {
    new (...args: any[]): any;
  }
  export type IAbstractClass = abstract new (...args: any[]) => any
  export interface IModuleOptions {
      providers?: (IClass | IProvider)[];
      controllers?: IClass[];
  }
  export interface IProvider {
      provide: IAbstractClass | IClass
      useClass: IClass
  }
  export interface IInjectMetadata {
      constructParams: (IClass | IAbstractClass)[]
  }
  export interface IControllerMetadata {
      prefix?: string
  }
  export interface IElectronMetadata {
      decorates: IElectronMetadataItem[]
  }
  interface IElectronMetadataItem {
      type: 'invoke' | 'send';
      channel: string;
      method: string;
  }