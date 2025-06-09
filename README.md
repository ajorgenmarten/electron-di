# 💉 electron-di

`electron-di` mejora la gestión de dependencias en aplicaciones Electron, facilitando la inyección de servicios y la modularidad del código. Permite desacoplar componentes y simplificar pruebas, haciendo el desarrollo más mantenible y escalable.

## Traducciones

Translation to [English](https://github.com/ajorgenmarten/electron-di/blob/main/README.en.md)

## Instalación

```bash
npm install electron-di
```

O usando Yarn:

```bash
yarn add electron-di
```

> **Nota:**  
> Si estás usando Vite, también debes instalar `@swc/core` y configurar el plugin correspondiente en tu archivo de configuración de Vite:
>
> ```bash
> npm install @swc/core --save-dev
> ```
>
> Luego, agrega el plugin de SWC en tu `vite.config.js` o `vite.config.ts` según la documentación de Vite y el plugin que utilices.

```ts
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, swcPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), swcPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin(), swcPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
```

## Configuración

Habilite decoradores en tsconfig.json. Para utilizar este paquete correctamente, debes habilitar los decoradores en tu archivo `tsconfig.json`

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    // ... otras opciones
  }
}
```

## Uso básico

```js
import { ElectronDI } from 'electron-di';
import AppModule from './app.module.ts'

// ...
ElectronDI.createApp(AppModule)
//...
```

## 🧩 Trabajando con Módulos en electron-di

El sistema de módulos en electron-di permite organizar tu aplicación en componentes reutilizables. Aquí está la documentación correcta:

### Estructura Básica

Para crear un módulo, utiliza el decorador `@Module()` con la siguiente estructura:

```ts
@Module({
    imports: [], // Otros módulos que quieres importar
    controllers: [], // Controladores que pertenecen a este módulo
    providers: [], // Servicios que pertenecen a este módulo
    exports: [] // Providers que quieres hacer disponibles a otros módulos
})
export class AppModule {}
```

### Ejemplo:

```ts
// user.service.ts
@Injectable()
export class UserService {
    getUsers() {
        return ['user1', 'user2'];
    }
}

// user.controller.ts
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}

    @Event('getUsers')
    getUsers(@Payload() data: any) {
        return this.userService.getUsers();
    }
}

// user.module.ts
@Module({
    controllers: [UserController],
    providers: [UserService]
})
export class UserModule {}

// app.module.ts
@Module({
    imports: [UserModule]
})
export class AppModule {}

// main.ts
import { ElectronDI } from 'electron-di';

ElectronDI.createApp(AppModule);
```

### Módulos Globales

Puedes hacer que un módulo sea accesible globalmente usando el decorador `@Global()`. Cuando un módulo se marca como global, todos los providers que exporta estarán disponibles para cualquier otro módulo de la aplicación sin necesidad de importarlo explícitamente:

```ts
@Global()
@Module({
    providers: [CommonService],
    exports: [CommonService]
})
export class CommonModule {}
```

La inyección de dependencias se maneja automáticamente a través del contenedor DI cuando inicializas tu aplicación con `ElectronDI.createApp(AppModule)`.

Esto permite:
- Organizar tu código en módulos cohesivos
- Reutilizar funcionalidad entre diferentes partes de tu aplicación
- Mantener un acoplamiento bajo entre componentes
- Gestionar el alcance de los servicios (global vs módulo específico)
- Facilitar las pruebas unitarias

## Controladores

### 🦩 ¿Qué es un Controlador?

En este framework, un Controlador es una clase que agrupa métodos para manejar eventos IPC `(ipcMain)` en Electron. Define canales lógicos donde se recibe comunicación desde el proceso renderer.

🔧 Decorador: `@Controller('prefijoOpcional')`

```ts
import { Controller } from 'electron-di';

@Controller('user')
export class UserController {
    // Métodos
}
```
El prefijo define el "namespace" para todos los canales que maneja ese controlador.

### 🚀 Cómo manejar eventos IPC

Existen dos decoradores para enlazar métodos con eventos:

| Decorador | Tipo de evento | Descripción                              |
|-----------|----------------|------------------------------------------|
|`@OnInvoke`|`ipcMain.handle`|Comunicación basada en promesas (`invoke`)|
|`@OnSend`  |`ipcMain.on`    |Comunicación tipo emit (`sin respuesta`)  |

#### Ejemplo:
```ts
import { Controller, OnInvoke, OnSend, Event, Payload } from 'electron-di';

@Controller('user')
export class UserController {
  
    @OnInvoke('create')
    async createUser(@Event() event, @Payload() payload) {
        // lógica de creación
        return { success: true, data: payload };
    }

    @OnSend('notify')
    notifyUser(@Event() event, @Payload() payload) {
        // lógica de notificación
    }
}
```

#### Resultado:
- user:create → manejado con invoke
- user:notify → manejado con on

## 🛠️ Decoradores de Parámetros

Los métodos pueden recibir inyecciones automáticas de ciertos valores según el decorador:

| Decorador | Parámetro                                   | Tipo                                    |
|-----------|---------------------------------------------|-----------------------------------------|
|`@Event`   |Evento de Electron                           |`IpcMainEvent` o `IpcMainInvokeEvent`    |
|`@Payload` |Datos enviados desde renderer (arg[0])       |`any`                                    |
|`@Request` |Objeto contexto completo `{ event, payload }`|`ExecutionContext` (`{ event, payload }`)|

## 🛡️ Guardias (Guards)

Los Guards son clases que permiten validar o interceptar la ejecución antes o después de manejar un evento. Son especialmente útiles para implementar mecanismos de autenticación, autorización, validaciones de datos o cualquier lógica previa y posterior a la ejecución de un controlador.

### Tipos de Guards

| Decorador | Cuándo se ejecuta                           | Tipo                                                                      |
|-----------|---------------------------------------------|---------------------------------------------------------------------------|
|`@Before`  |Antes de ejecutar el método                  |Síncrono o asíncrono (debe retornar un `booleano` o lanzar una `excepción`)|
|`@After`   |Después de ejecutar el método                |Síncrono o asíncrono (es de tipo `void`)                                   |

Los guardias se pueden aplicar:
- A nivel de clase controlador (`@Controller`)
- A nivel de metodo (`@OnSend`, `@OnInvoke`) para un control mas específico

Un Before Guard puede prevenir la ejecución de un controlador retornando false o lanzando una excepción.
Un After Guard se ejecuta tras el método principal y puede realizar tareas como logging, métricas o auditoría.

#### Ejemplo:

```ts
import { Controller, OnInvoke, Before } from 'electron-di';
import { AuthGuard } from './guards/AuthGuard';
import { AnotherGuard } from './guards/AnotherGuard';

@Before(AuthGuard) // A nivel de clase
@Controller('secure')
export class SecureController {

    @OnInvoke('secret')
    @Before(AnotherGuard) // A nivel de método
    async getSecret(@Payload() payload) {
        return { data: 'super-secret-data' };
    }
}
```

## Implementación de un Guard

Los Guards son clases que implementan un método `execute()` que puede ser síncrono o asíncrono. Para utilizarlos, deben estar registrados como providers en un módulo. Si se desea utilizar el Guard en otros módulos, debe ser exportado explícitamente. El método `execute()` debe retornar un valor booleano que determina si se permite o no la ejecución del controlador.

### 1. Crear la clase Guard

La clase debe:
- Usar el decorador `@Injectable()`
- Implementar un método `execute()`
- Retornar `boolean` o `Promise<boolean>`
- Opcionalmente, lanzar excepciones para control de errores

### 2. Estructura básica

```ts
@Injectable()
export class AuthGuard {
    async execute(@Payload() payload) {
        if (!payload.token) return false;
        // Validar el token o realizar lógica de seguridad
        return true;
    }
}
```

### Inyección de Dependencias en Guardias

Los Guards también son decorados con `@Injectable`, lo cual significa que pueden tener inyección de dependencias igual que un servicio o un controlador. Esto te permite construir Guards más complejos que dependan de otros servicios como bases de datos, autenticación, etc.

Además, los parámetros del método execute pueden ser resueltos automáticamente usando los decoradores:

- @Event() para el evento de Electron.
- @Payload() para el payload enviado.
- @Request() para el objeto contexto completo.

## 🧬 Inyección de Dependencias — `@Injectable`

El decorador `@Injectable` marca una clase como inyectable, permitiendo que el contenedor de dependencias cree instancias de ella y resuelva automáticamente sus dependencias.

Cuando una clase es decorada con `@Injectable`, puedes:
- Inyectar otras clases también decoradas como `@Injectable`.
- Gestionar el ciclo de vida: singleton por defecto.
- Simplificar la construcción y mantenimiento de servicios y guards complejos.

### Ventajas de `@Injectable`

- Inyección automática: El framework detecta los parámetros del constructor y los resuelve automáticamente.
- Ciclo de vida controlado: Por defecto, las instancias son singletons, asegurando que solo se crea una instancia para toda la aplicación.
- Uso en cualquier parte: Servicios (`Service`), Guards (`Guard`), Repositorios (`Repository`) pueden ser inyectables.

#### Ejemplo:

```ts
import { Injectable } from 'electron-di';

@Injectable()
export class UserService {
    getUser(id: string) {
        return { id, name: 'Usuario de Prueba' };
    }
}

@Injectable()
export class UserController {
    constructor(private userService: UserService) {}

    @OnInvoke('get-user')
    getUser(@Payload() payload) {
        return this.userService.getUser(payload.id);
    }
}
```

## 🔧 Utilidades Avanzadas: applyDecorator y SetMetadata

`applyDecorator`
Esta función permite combinar múltiples decoradores (`ClassDecorator` o `MethodDecorator`) en una única llamada, mejorando la legibilidad del código.

#### Ejemplo:
```ts
import { applyDecorator, Controller, Before } from 'electron-di';

@applyDecorator(
  Controller('admin'),
  Before(AuthGuard)
)
export class AdminController {
    // Métodos aquí
}
```

`SetMetadata`
`SetMetadata` permite asociar información personalizada (metadata) a clases o métodos. Esto es útil, por ejemplo, para establecer permisos, roles o cualquier configuración extra.

#### Ejemplo:
```ts
import { SetMetadata, Controller, OnInvoke } from 'electron-di';

@Controller('profile')
export class ProfileController {

    @SetMetadata('roles', ['admin', 'user'])
    @Before(AuthGuard)
    @OnInvoke('get-profile')
    getProfile(@Payload() payload) {
        return { profileId: payload.id };
    }
}
```

#### Ejemplo usando las utilidades:
```ts
// decorators/RolesGuard.ts
import { applyDecorators, SetMetadata, Before } from 'electron-di'
import { AuthGuard } from '../guards/AuthGuard'
import { RolesGuard } from '../guards/RolesGuard'

export function Roles(roles: string[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    Before(AuthGuard),
    Before(RolesGuard)
  )
}

// guards/AuthGuard
import { Injectable, Guard } from 'electron-di'

@Injectable()
export default class AuthGuard implements Guard {
  async execute(@Payload() payload) {
    // ejecutar lógica...
    return true
  }
}

// guards/AuthGuard
import { Injectable, Guard, Reflector } from 'electron-di'

// El scope está definido como transient porque
// al acceder a la clase Reflector, necesitamos
// una nueva instancia cada vez para obtener correctamente
// los metadatos definidos a nivel de controlador o manejador.
// Esto asegura una resolución adecuada de metadatos
// a través de diferentes contextos de ejecución.
@Injectable({ scope: 'transient' })
export default class RolesGuard implements Guard {
  constructor(private readonly reflector: Reflector) {}
  async execute(@Payload() payload) {
    const roles = reflector.get('roles')
    // ejecutar lógica...
    return true
  }
}

// controllers/SecurityController.ts
import { Controller, OnInvoke } from 'electron-di'
import { LogsPagination } from './prots/inputs'
import SecurityService from './SecurityService'

@Controller('security')
export default class SecurityController {
  constructor(private readonly _service: SecurityService) {}

  // Este decorador proporciona una capa de seguridad
  // validando la autenticación del usuario y verificando
  // si tiene los roles requeridos.
  // Combina tanto AuthGuard como RolesGuard
  // en un único decorador para una implementación más limpia.
  @Roles(['admin'])
  async getLogs(@Payload() payload: LogsPagination) {
    return await this._service.getLogs(payload)
  }
}
```

Creado con ❤️ por [Alejandro Jorgen Martén](https://github.com/ajorgenmarten)
