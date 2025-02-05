/**
 * Interface que representa una clase con constructor.
 */
interface IClass {
    new (...args: any[]): any;
}
/**
 * Tipo que representa una clase abstracta con constructor.
 */
type IAbstractClass = abstract new (...args: any[]) => any;
/**
 * Opciones para configurar controladores y proveedores utilizados por el módulo.
 */
interface IModuleOptions {
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
interface IProvider {
    /**
     * Clase abstracta o clase simple que define un proveedor para inyección en el módulo.
     */
    provide: IAbstractClass | IClass;
    /**
     * Clase que se resuelve al inyectar o hacer referencia a la clase proporcionada.
     */
    useClass: IClass;
}

declare class ModuleContainer {
    private readonly instances;
    private readonly providers;
    /**
     * Registra una dependencia en el contenedor de módulos.
     * @param provider Clase o proveedor a registrar.
     */
    registerDependency(provider: IClass | IProvider): void;
    /**
     * Resuelve una dependencia y devuelve una instancia de ella.
     * @param token Identificador o clase de la dependencia a resolver.
     * @returns Instancia de la dependencia.
     */
    resolveDependency(token: string | IAbstractClass | IClass): any;
}
declare class DependencyInjector {
    private readonly container;
    /**
     * Registra un módulo en el contenedor.
     * @param classModule Clase del módulo a registrar.
     */
    registerModule(classModule: IClass): void;
    /**
     * Resuelve una dependencia en un módulo específico.
     * @param classModule Clase del módulo.
     * @param token Identificador o clase de la dependencia a resolver.
     * @returns Instancia de la dependencia.
     */
    resolveDependency(classModule: IClass, token: string | IClass | IAbstractClass): any;
    /**
     * Obtiene el contenedor de módulos.
     * @returns Contenedor de módulos.
     */
    get Container(): Map<string, ModuleContainer>;
}
declare const container: DependencyInjector;

/**
 * Decorador para inyectar dependencias en los parámetros del constructor de una clase.
 * Este decorador se utiliza para registrar la dependencia que debe ser inyectada automáticamente.
 *
 * @param token - La clase o clase abstracta que se desea inyectar.
 * @returns Un decorador que registra la dependencia en los metadatos de la clase.
 *
 * @example
 *
 * [@Injectable()]
 * class ServiceClass {
 *   doSomething() {
 *     console.log("Doing something...");
 *   }
 * }
 *
 * class ControllerClass {
 *   constructor(@Inject(ServiceClass) private readonly service: ServiceClass) {}
 *
 *   execute() {
 *     this.service.doSomething();
 *   }
 * }
 *
 */
declare function Inject(token: IClass | IAbstractClass): (target: IClass, _propertyKey: string | undefined, paramIndex: number) => void;
/**
 * Decorador para marcar una clase como inyectable.
 * Este decorador registra la clase como un proveedor que puede ser inyectado en otras clases.
 *
 * @returns Un decorador que registra la clase como inyectable en los metadatos.
 *
 * @example
 *
 * [@Injectable()]
 * class ExampleService {
 *
 *   greet() {
 *     console.log("Hello, world!");
 *   }
 *
 * }
 *
 */
declare function Injectable(): (target: IClass) => void;
/**
 * Decorador para definir una clase como un controlador IPC.
 * Este decorador registra la clase como un controlador y permite agregar un prefijo a todos los canales IPC.
 *
 * @param prefix - Prefijo opcional para los canales IPC de este controlador.
 * @returns Un decorador que registra la clase como un controlador en los metadatos.
 *
 * @example
 *
 * [@Controller("example")]
 * class ExampleController {
 *
 *   [@OnInvoke("greet")]
 *   greet() {
 *     return "Hello, world!";
 *   }
 *
 * }
 *
 */
declare function Controller(prefix?: string): (target: IClass) => void;
/**
 * Decorador para registrar un método como un manejador de mensajes IPC de tipo "invoke".
 * Este decorador asocia un canal IPC con un método de la clase.
 *
 * @param channel - El nombre del canal IPC.
 * @returns Un decorador que registra el método como un manejador de mensajes IPC.
 *
 * @example
 *
 * [@Controller()]
 * class ExampleController {
 *
 *   [@OnInvoke("greet")]
 *   greet() {
 *     return "Hello, world!";
 *   }
 *
 * }
 *
 */
declare function OnInvoke(channel: string): (target: any, propertyKey: string) => void;
/**
 * Decorador para registrar un método como un manejador de mensajes IPC de tipo "send".
 * Este decorador asocia un canal IPC con un método de la clase.
 *
 * @param channel - El nombre del canal IPC.
 * @returns Un decorador que registra el método como un manejador de mensajes IPC.
 *
 * @example
 *
 * [@Controller()]
 * class ExampleController {
 *
 *   [@OnSend("notify")]
 *   notify(message: string) {
 *     console.log("Received message:", message);
 *   }
 *
 * }
 *
 */
declare function OnSend(channel: string): (target: any, propertyKey: string) => void;
/**
 * Decorador para definir un módulo en la aplicación.
 * Este decorador registra la clase como un módulo y permite configurar proveedores y controladores.
 *
 * @param options - Opciones del módulo, como proveedores y controladores.
 * @returns Un decorador que registra la clase como un módulo en los metadatos.
 *
 * @example
 *
 * [@Module({
 *   providers: [ExampleService],
 *   controllers: [ExampleController],
 * })]
 * class AppModule {}
 *
 */
declare function Module(options: IModuleOptions): (target: IClass) => void;

/**
 * Inicializa y configura los módulos y sus controladores.
 * @param modules Lista de clases de módulos a inicializar.
 */
declare function Bootstrap(...modules: IClass[]): void;

export { Bootstrap, Controller, Inject, Injectable, Module, OnInvoke, OnSend, container };
