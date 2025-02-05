/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Interface que representa una clase con constructor.
 */
export interface IClass {
  new (...args: any[]): any;
}

/**
 * Tipo que representa una clase abstracta con constructor.
 */
export type IAbstractClass = abstract new (...args: any[]) => any;

/**
 * Opciones para configurar controladores y proveedores utilizados por el módulo.
 */
export interface IModuleOptions {
  /**
   * Grupo de clases proveedoras que se inyectan automáticamente para el módulo.
   */
  providers?: (IClass | IProvider)[];

  /**
   * Grupo de clases que actúan como controladoras para las peticiones de IPC.
   */
  controllers?: IClass[];
}

/**
 * Interface que representa un proveedor.
 */
export interface IProvider {
  /**
   * Clase abstracta o clase simple que define un proveedor para inyección en el módulo.
   */
  provide: IAbstractClass | IClass;

  /**
   * Clase que se resuelve al inyectar o hacer referencia a la clase proporcionada.
   */
  useClass: IClass;
}

/**
 * Metadatos de información para los decoradores de OnInvoke y OnSend.
 */
export interface IElectronMetadataItem {
  type: "invoke" | "send";
  channel: string;
  method: string;
}

/**
 * Metadatos de decoración para proveedores, controladores y módulos.
 */
export interface IDecorateMetadata {
  type: "provider" | "controller" | "module";
  prefix?: string;
  decorates?: IElectronMetadataItem[];
  dependencies?: (IClass | IAbstractClass)[];
  options?: IModuleOptions;
}
