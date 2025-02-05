import { CLASS_METADATA_KEY } from "./constants";
import { IAbstractClass, IClass, IDecorateMetadata, IElectronMetadataItem, IModuleOptions } from "./types";

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
export function Inject(token: IClass | IAbstractClass) {
    return function (target: IClass, _propertyKey: string | undefined, paramIndex: number) {
        let metadata: IDecorateMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, target);

        if (metadata === undefined) {
            metadata = { dependencies: [], type: 'provider' };
        }

        if (!Array.isArray(metadata.dependencies)) {
            metadata.dependencies = [];
        }

        metadata.dependencies[paramIndex] = token;

        Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target);
    };
}

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
export function Injectable() {
    return function (target: IClass) {
        const setMetadata: IDecorateMetadata = { type: 'provider' };
        let metadata: IDecorateMetadata | undefined = Reflect.getMetadata(CLASS_METADATA_KEY, target);
        metadata = metadata === undefined ? setMetadata : { ...metadata, ...setMetadata };
        Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target);
    };
}

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
export function Controller(prefix?: string) {
    return function (target: IClass) {
        const setMetadata: IDecorateMetadata = { type: 'controller', prefix };
        let metadata: IDecorateMetadata | undefined = Reflect.getMetadata(CLASS_METADATA_KEY, target);
        metadata = metadata === undefined ? setMetadata : { ...metadata, ...setMetadata };
        Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target);
    };
}

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
export function OnInvoke(channel: string) {
    return function (target: any, propertyKey: string) {
        const decorate: IElectronMetadataItem = { channel, method: propertyKey, type: 'invoke' };
        let metadata: IDecorateMetadata | undefined = Reflect.getMetadata(CLASS_METADATA_KEY, target);
        if (metadata === undefined) {
            metadata = { type: 'controller', decorates: [decorate] };
            Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target);
        } else {
            if (metadata.decorates === undefined) metadata.decorates = [];
            metadata.decorates.push(decorate);
            Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target);
        }
    };
}

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
export function OnSend(channel: string) {
    return function (target: any, propertyKey: string) {
        const decorate: IElectronMetadataItem = { channel, method: propertyKey, type: 'send' };
        let metadata: IDecorateMetadata | undefined = Reflect.getMetadata(CLASS_METADATA_KEY, target);
        if (metadata === undefined) {
            metadata = { type: 'controller', decorates: [decorate] };
            Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target);
        } else {
            if (metadata.decorates === undefined) metadata.decorates = [];
            metadata.decorates.push(decorate);
            Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target);
        }
    };
}

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
export function Module(options: IModuleOptions) {
    return function (target: IClass) {
        const setMetadata: IDecorateMetadata = { type: 'module', options };
        Reflect.defineMetadata(CLASS_METADATA_KEY, setMetadata, target);
    };
}