declare const COLORS: {
    BACKGROUND: {
        LIGHT: {
            BLACK: string;
            RED: string;
            GREEN: string;
            YELLOW: string;
            BLUE: string;
            MAGENTA: string;
            CYAN: string;
            WHITE: string;
            DEFAULT: string;
        };
        DARK: {
            BLACK: string;
            RED: string;
            GREEN: string;
            YELLOW: string;
            BLUE: string;
            MAGENTA: string;
            CYAN: string;
            WHITE: string;
            DEFAULT: string;
        };
    };
    FOREGROUND: {
        LIGHT: {
            BLACK: string;
            RED: string;
            GREEN: string;
            YELLOW: string;
            BLUE: string;
            MAGENTA: string;
            CYAN: string;
            WHITE: string;
            DEFAULT: string;
        };
        DARK: {
            BLACK: string;
            RED: string;
            GREEN: string;
            YELLOW: string;
            BLUE: string;
            MAGENTA: string;
            CYAN: string;
            WHITE: string;
            DEFAULT: string;
        };
    };
};
type ColorFor = keyof typeof COLORS;
type ColorType = keyof (typeof COLORS)[ColorFor];
type ColorValue = keyof (typeof COLORS)[ColorFor][ColorType];
interface ThemeProps {
    font?: {
        colorType: ColorType;
        colorValue: ColorValue;
    };
    background?: {
        colorType: ColorType;
        colorValue: ColorValue;
    };
}
interface CustomLoggerProps {
    title: ThemeProps;
    message: ThemeProps;
}
declare class Logger {
    static log(message: string, title?: string, ...args: any[]): void;
    static info(message: string, title?: string, ...args: any[]): void;
    static success(message: string, title?: string, ...args: any[]): void;
    static error(message: string, title?: string, ...args: any[]): void;
    static warn(message: string, title?: string, ...args: any[]): void;
    static customLogger(options: CustomLoggerProps): (message: string, title?: string, ...args: any[]) => void;
}

type Class<T = any> = new (...args: any[]) => T;

type AbstractClass<T = any> = abstract new (...args: any[]) => T;

type Token<T = any> = Class<T> | AbstractClass<T>;

type MiddlewareReturnType<T = "Before" | "After"> = T extends "After"
  ? Promise<void> | void
  : Promise<boolean> | boolean;

type IMiddleware<T = "Before" | "After"> = {
  execute(...args: any[]): MiddlewareReturnType<T>;
};

interface IRequest<PayloadDataType = any> {
  Event: IpcMainInvokeEvent | IpcMainEvent;
  Payload?: PayloadDataType | undefined;
}

/**
 * Decorador que registra un middleware "After" para ser ejecutado después de un método o clase.
 *
 * @param token - El token de inyección de dependencias que identifica el middleware a ejecutar
 *
 * @example
 * // Middleware a nivel de clase
 * |@After(LoggerMiddleware)
 * class UserController {
 *   // ...
 * }
 *
 * @example
 * // Middleware a nivel de método
 * class UserController {
 *   |@After(ValidationMiddleware)
 *   |@OnInvoke('create-user')
 *   public async createUser() {
 *     // ...
 *   }
 * }
 *
 * El middleware se ejecutará en el siguiente orden:
 * 1. Ejecución original del método/clase
 * 2. Middleware After
 */
declare function After(token: Token): (target: any, propertyKey?: string | undefined, _propertyDescriptor?: PropertyDescriptor) => void;

/**
 * Decorador que permite ejecutar middleware antes de un método o clase
 *
 * @param token - Token que identifica el middleware a ejecutar
 * @example
 * // Uso a nivel de clase
 * |@Before(AuthMiddleware)
 * class UserController {
 *   // ...
 * }
 *
 * // Uso a nivel de método
 * class UserController {
 *   |@Before(LogMiddleware)
 *   |@OnInvoke('get-users')
 *   public async getUsers() {
 *     // ...
 *   }
 * }
 *
 * @remarks
 * Este decorador puede ser usado tanto a nivel de clase como a nivel de método.
 * Cuando se usa a nivel de clase, el middleware se ejecutará antes de todos los métodos.
 * Cuando se usa a nivel de método, el middleware se ejecutará solo antes de ese método específico.
 */
declare function Before(token: Token): (target: any, propertyKey?: string | undefined, _propertyDescriptor?: PropertyDescriptor) => void;

/**
 * Decorador que permite inyectar el payload de un evento IPC como parámetro en un método.
 *
 * @remarks
 * Este decorador se utiliza para marcar un parámetro de un método que debe recibir
 * el payload enviado desde el proceso principal o renderer de Electron.
 *
 * @example
 * ```typescript
 * |@Controller()
 * class MyService {
 *   |@OnInvoke('my-event')
 *   handleEvent(@Payload() data: any) {
 *     console.log(data); // Payload del evento IPC
 *   }
 * }
 * ```
 */
declare function Payload(): (target: any, propertyKey: string, paramIndex: number) => void;

/**
 * Función decoradora para Controladores
 * Marca una clase como controlador y permite establecer un prefijo de ruta
 *
 * @param prefix - Prefijo URL opcional para todas las rutas en este controlador
 * @returns Función decoradora que agrega metadatos de controlador a la clase objetivo
 * @example
 * ```ts
 * |@Controller('users')
 * class UserController {
 *   // Métodos del controlador
 * }
 * ```
 */
declare function Controller(prefix?: string): (target: any) => void;

/**
 * Decorador que marca un moduleo como global.
 * Cuando una clase es marcada como global, estará disponible en todos los contextos de la aplicación.
 *
 * @example
 * ```typescript
 * |@Global()
 * |@Module({
 *   providers: [UserService],
 *   exports: [UserService],
 * })
 * class MyGlobalModule { }
 * ```
 *
 * @returns {Function} Decorador que puede ser aplicado a una clase
 */
declare function Global(): (target: Class) => void;

/**
 * Decorador para inyección de dependencias en parámetros del constructor.
 * @template T - Tipo del token a inyectar
 * @param token - Token que representa la dependencia a inyectar
 * @returns Decorador de parámetro
 */
declare function Inject<T>(token: Token<T>): ParameterDecorator;

/**
 * Decorador que marca una clase como inyectable.
 * Permite que la clase sea gestionada por el contenedor de inyección de dependencias.
 *
 * @example
 * ```typescript
 * |@Injectable()
 * class MyService {
 *   // ...
 * }
 * ```
 *
 * Al marcar una clase con @Injectable(), esta puede ser:
 * - Inyectada automáticamente en otras clases
 * - Instanciada por el contenedor de DI
 * - Gestionada su ciclo de vida por el contenedor
 */
declare function Injectable(): (target: Class) => void;

/**
 * Decorador que marca un parámetro como un evento IPC.
 *
 * @remarks
 * Este decorador se utiliza para inyectar eventos IPC en los métodos de una clase.
 * Los eventos IPC son utilizados para la comunicación entre procesos en Electron.
 *
 * @example
 * ```typescript
 * |@Controller()
 * class MyClass {
 *   |@OnInvoke('my-event')
 *   public myMethod(@IPCEvent() event: IpcMainEvent) {
 *     // Manejar el evento IPC
 *   }
 * }
 * ```
 *
 * @returns Un decorador de parámetro que registra los metadatos necesarios
 * para la inyección del evento IPC.
 */
declare function IPCEvent(): (target: any, propertyKey: string, paramIndex: number) => void;

type IProvider = { provide: Token; useClass: Class } | Class;

interface ModuleOptions {
  providers?: IProvider[];
  controllers?: Class[];
  imports?: Class[];
  exports?: Token[];
}

/**
 * Decorador de módulo que permite configurar y definir un módulo en la aplicación.
 *
 * @param {ModuleOptions} options - Opciones de configuración del módulo que incluyen:
 *   - providers: Arreglo de proveedores de servicios para el módulo
 *   - imports: Otros módulos que este módulo necesita importar
 *   - exports: Proveedores que este módulo expone a otros módulos
 *   - controllers: Controladores que maneja este módulo
 *
 * @example
 * ```typescript
 * |@Module({
 *   providers: [MyService],
 *   controllers: [MyController]
 * })
 * export class MyModule {}
 * ```
 */
declare function Module(options: ModuleOptions): (target: Class) => void;

/**
 * Decorador que permite registrar un método como un manejador de eventos IPC (Inter-Process Communication)
 * utilizando el patrón invoke/handle.
 *
 * @param channel - Nombre del canal IPC por el cual se comunicarán los procesos
 * @returns Decorador de método que registra los metadatos necesarios para la comunicación IPC
 *
 * @example
 * |@Controller()
 * class Controller {
 *   |@OnInvoke('get-data')
 *   public async getData() {
 *     return { message: 'Hello from main process' };
 *   }
 * }
 */
declare function OnInvoke(channel: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;

/**
 * Decorador que permite escuchar eventos IPC enviados desde el proceso principal.
 *
 * @param channel - El nombre del canal IPC por el cual se enviará el mensaje
 * @returns Decorador de método que configura el handler para eventos IPC
 *
 * @example
 * |@Controller()
 * class MyClass {
 *   |@OnSend('my-channel')
 *   handleMessage(data: any) {
 *     // Manejar el mensaje recibido
 *   }
 * }
 */
declare function OnSend(channel: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;

/**
 * Decorador que permite inyectar el objeto Request en los parámetros de un método.
 *
 * @remarks
 * Este decorador se utiliza para marcar un parámetro que debe recibir el objeto Request
 * durante la ejecución del método.
 *
 * @example
 * ```typescript
 * |@Controller()
 * class MyController {
 *   |@OnInvoke('my-event')
 *   public someMethod(@Request() req: any) {
 *     // req contiene el objeto Request
 *   }
 * }
 * ```
 *
 * @returns Decorador de parámetro que configura la inyección del objeto Request
 */
declare function Request(): (target: any, propertyKey: string, paramIndex: number) => void;

/**
 * Decorador que permite inyectar el objeto Response en los parámetros del método.
 *
 * @remarks
 * Este decorador se utiliza para marcar un parámetro que debe recibir el objeto Response
 * en los métodos del controlador.
 *
 * @example
 * ```typescript
 * |@Controller()
 * class MyController {
 *   |@OnInvoke('my-event')
 *   public async handleRequest(@Response() response: any) {
 *     // El objeto response estará disponible aquí
 *   }
 * }
 * ```
 *
 * @returns Decorador de parámetro que configura la inyección del objeto Response
 */
declare function Response(): (target: any, propertyKey: string, paramIndex: number) => void;

/**
 * Inicializa la aplicación Electron con el módulo principal.
 * Registra todos los controladores y middlewares definidos en el módulo.
 *
 * @param module - El módulo principal de la aplicación
 * @throws {Error} Si el módulo no está correctamente configurado
 *
 * @example
 * Bootstrap(AppModule);
 */
declare function Bootstrap(module: Class): void;

export { After, Before, Bootstrap, Controller, Global, type IMiddleware, IPCEvent, type IRequest, Inject, Injectable, Logger, Module, OnInvoke, OnSend, Payload, Request, Response };
