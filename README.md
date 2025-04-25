# **ELECTRON DI**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
[![Electron Version](https://img.shields.io/badge/electron-~30.0.2-blue)](https://www.electronjs.org/)

Este proyecto tiene como objetivo facilitar la creación de aplicaciones de escritorio multiplataforma utilizando Electron, combinado con una arquitectura modular y escalable inspirada en NestJS. La idea es aprovechar las mejores prácticas de desarrollo backend, como la inyección de dependencias, módulos y controladores, para construir aplicaciones de escritorio robustas y mantenibles. El enfoque busca simplificar el desarrollo, promoviendo la reutilización de código y una estructura clara, ideal para proyectos complejos o equipos que deseen aplicar patrones modernos de desarrollo en aplicaciones de escritorio.

## Características principales

- **Inyección de dependencias:** El proyecto implementa un sistema de inyección de dependencias inspirado en frameworks como NestJS, permitiendo una gestión eficiente y organizada de los componentes de la aplicación. Este enfoque facilita la desacoplamiento del código, mejora la testabilidad y promueve la reutilización de servicios y módulos. Con la DI, los desarrolladores pueden definir y administrar dependencias de manera centralizada, simplificando el mantenimiento y escalabilidad de las aplicaciones de Electron.

- **Modularización:** El proyecto adopta un enfoque de modularización que organiza la aplicación en módulos independientes y cohesivos, siguiendo principios similares a los de NestJS. Cada módulo encapsula funcionalidades específicas, como servicios, controladores o utilidades, lo que facilita la organización del código y su mantenimiento. Esta estructura modular permite a los desarrolladores escalar la aplicación de manera eficiente, reutilizar componentes y mantener un flujo de trabajo claro y ordenado.

- **Middlewares:** El proyecto introduce un sistema avanzado de middlewares para aplicaciones de Electron, inspirado en frameworks modernos como NestJS. Estos middlewares se dividen en dos tipos clave:
  - **Middlewares Before:** Se ejecutan **antes** de que la solicitud llegue al método del controlador. Son ideales para validaciones, autenticación o lógica previa. Si algún middleware before falla, se detiene la ejecución y no se llega al controlador.
  - **Middlewares After:** Se ejecutan **después** de que el controlador ha procesado la solicitud y ha generado una respuesta. Son útiles para tareas como logging, transformación de respuestas o limpieza de recursos.

Esta dualidad permite un control granular sobre el flujo de la aplicación, brindando flexibilidad y potencia para manejar escenarios complejos en aplicaciones de escritorio.

## Instalación

Para poder instalar y utilizar este paquete, es necesario que tu aplicación de **Electron** esté desarrollada con **TypeScript**. Este paquete está diseñado para integrarse con proyectos que utilizan TypeScript como lenguaje principal, aprovechando sus ventajas en cuanto a tipado y seguridad en el código.

```js
npm install electron-di
```

Después de instalar el paquete, habilita en el tsconfig.json la opcion de **experimentalDecorators** y **emitDecoratorMetadata** poniéndolas como `true`

```json
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    /* ... Demás propiedades del tsconfig.json*/
  }
```

## Decoradores

Este paquete proporciona un conjunto de decoradores diseñados específicamente para facilitar la inyección de dependencias y la resolución de módulos de Electron. Estos decoradores te permiten gestionar de manera eficiente las dependencias de tu aplicación y acceder a los módulos principales de Electron (main y renderer) de forma segura y organizada.

## Decorador `@Module`

El decorador `@Module` se utiliza para definir un módulo en tu aplicación. Un módulo es una clase decorada que organiza y encapsula funcionalidades relacionadas, como proveedores `(providers)`, controladores `(controllers)`, dependencias de otros módulos `(imports)` y exportar proveedores `(exports)` para su uso en otros modulos. Este decorador es fundamental para estructurar aplicaciones modulares y escalables.

### Opciones del decorador `@Module`

- `providers` (opcional): Un arreglo de clases decoradas con `@Injectable` que representan los servicios o proveedores de este módulo. Estos proveedores pueden ser inyectados en otros componentes del módulo, como controladores o otros servicios.
  ```typescript
  providers: [
    MiServicio,
    OtroServicio,
    {
      provide: MiAbstractRepository,
      useClass: InMemoryRepository,
    },
  ];
  ```
  > **`ℹ️ Nota:`** Puedes registrar los servicios simplemente agregando la clase decorada con `@Injectable` o con un objeto que tienes dos valores, el `provide` y `useClass`.
  - `provide`: Acepta una clase asbtracta o una clase común, que es valor con el que se van a identificar a la hora de resolver la dependencia en otro proveedor, en un controlador o middleware, (Este no tiene que estar decorado con `@Injectable`).
  - `useClass`: Solo acepta clase común, que estas si deben estar decoradas con `@Injectable`, esta es la verdadera clase que se va a resolver e inyectar en proveedores, controladores etc...
- `imports` (opcional): Un arreglo de módulos que exportan proveedores que este módulo necesita. Los proveedores exportados por estos módulos estarán disponibles para inyección en este módulo.
  ```typescript
  imports: [OtroModulo, OtroModuleMas];
  ```
- `controllers` (opcional): Un arreglo de controladores que manejan los métodos de punto de entrada **IPC (Inter-Process Communication)** en tu aplicación de Electron. Estos controladores deben estar decorados con `@Controller`.
  ```typescript
  controllers: [SomeController, OtherController];
  ```
- `exports` (opcional): Un arreglo de proveedores que este módulo desea hacer disponibles para otros módulos que lo importen. Solo los proveedores definidos en providers pueden ser exportados.
  ```typescript
  exports: [MiServicio, MiAbstractRepository];
  ```
  > **`ℹ️ Nota:`** Si registras un proveedor con un objeto que indica la clase proveida en para inyectar y la clase que se va a usar `({ provide: SomeAbstractClass, useClass: SomeClassProvider })` para exportarlo en el arreglo de exports tienes que agregar la clase abstracta (el valor de `provide`)

### Uso Básico

```js
import { Module } from "electron-di";

@Module({
  imports: [OtroModulo],
  providers: [MiServicio],
  controllers: [MiControlador],
  exports: [MiServicio],
})
export class MiModulo {}
```

### Uso avanzado

```typescript
import { Injectable, Inject, Controller, Module, OnInvoke } from "electron-di";

abstract class AppRepository {
  abstract getRandomName(): string;
}

@Injectable()
class AppRepositoryImplementation implements AppRepository {
  private names = [
    "Alejandro",
    "Andrea",
    "Angela",
    "Amanda",
    "Raudenis",
    "Mayara",
    "Michel Paxulo",
  ];
  getRandomName() {
    return this.names[Math.floor(Math.random() * this.names.length)];
  }
}

@Injectable()
class AppService {
  constructor(
    @Inject(AppRepository) private readonly appRepository: AppRepository
  ) {}
  greet() {
    return `Hello ${this.appRepository.getRandomName()}!`;
  }
}

@Controller("app")
class AppController {
  constructor(@Inject(AppService) private readonly appService: AppService) {}

  @OnInvoke("greet")
  async greet() {
    return this.appService.greet();
  }
}

@Module({
  providers: [
    AppService,
    {
      provide: AppRepository,
      useClass: AppRepositoryImplementation,
    },
  ],
  controllers: [AppController],
  exports: [AppRepository],
})
export class AppModule {}
```

## Decorador `@Injectable`

El decorador `@Injectable` se utiliza para marcar una clase como autoinyectable. Esto significa que la clase será gestionada automáticamente por el contenedor de inyección de dependencias, y sus instancias podrán ser inyectadas en otras clases que las requieran sin necesidad de instanciarlas manualmente.

### Uso Básico

```typescript
import { Injectable } from "electron-di";

@Injectable()
export class ExampleProvider {}
```

## Decorador `@Controller`

El decorador `@Controller` se utiliza para marcar una clase como un controlador que maneja métodos de punto de entrada **IPC (Inter-Process Communication)** en tu aplicación de Electron. Este decorador acepta un parámetro opcional que define un prefijo de ruta para todos los métodos IPC contenidos en la clase.

### Uso Básico

```typescript
import { Controller } from "electron-di";

@Controller()
export class AppController {}

@Controller("some")
export class SomeController {}
```

## Decorador `@Global`

El decorador `@Global` se utiliza para marcar un módulo como global. Esto significa que los proveedores exportados por este módulo estarán disponibles para todos los demás módulos de la aplicación sin necesidad de importar el módulo global explícitamente. Es especialmente útil para proveedores que se utilizan en toda la aplicación, como configuraciones, servicios de utilidad o conexiones a bases de datos.

> **`ℹ️ Nota:`** Este decorador solo se puede usar en modulos tal como en el ejemplo siguiente

```typescript
import { Module, Global } from "electron-di";

@Global()
@Module({
  providers: [ORMService],
  exports: [ORMService],
})
export class ORMModule {}
```

## Decoradores `@Before` y `@After`

Los decoradores `@Before` y `@After` se utilizan para aplicar middlewares a métodos o clases decoradas con `@Controller`. Estos middlewares permiten ejecutar lógica adicional antes `(@Before)` o después `(@After)` de que se ejecute el método del controlador.

### Características principales

- **Middlware:** Permiten ejecutar lógica adicional antes o después de un método
- **Aplicación:** Solo se pueden aplicar a métodos o clases decoradas con `@Controller`.
- **Proveedores:** Aceptan un proveedor (clase decorada con `@Injectable`) que debe implementar un método `execute`.
- **Retorno:** El método `execute` del proveedor que usa el decorador debe retornar un booleano en caso de ser usado con `@Before` y void con `@After`

### Uso Básico

```typescript
import {
  Injectable,
  Controller,
  Before,
  type IMiddleware,
  OnInvoke,
} from "electron-di";

@Injectable()
class BeforeAll implements IMiddleware<"Before"> {
  async excecute() {
    console.log("Before all\n");
    const validations = true;
    return validations;
  }
}

@Injectable()
class BeforeGreet implements IMiddleware<"Before"> {
  async excecute() {
    console.log("Before Greet\n");
    const validations = true;
    return validations;
  }
}

@Before(BeforeAll)
@Controller("app")
class AppController {
  @Before(BeforeGreet)
  @OnInvoke("foo")
  async foo() {
    console.log("foo\n");
    return "foo";
  }

  @OnInvoke("bar")
  async bar() {
    console.log("bar\n");
    return "bar";
  }
}
```

En el ejemplo anterior si se hace una llamada IPC con el metodo invoke a `app:foo` se mostrará en consola lo sigiente:

```bash
 > Before all
   Before Greet
   foo
```

Y si la llamada se hace a `app:bar` se mostraría lo siguiente:

```bash
 > Before all
   bar
```

### Ejemplo con `@After`

```typescript
import {
  Injectable,
  Controller,
  After,
  type IMiddleware,
  OnInvoke,
} from "electron-di";

@Injectable()
class AfterAll implements IMiddleware<"After"> {
  async excecute() {
    console.log("After all\n");
  }
}

@Injectable()
class AfterGreet implements IMiddleware<"After"> {
  async excecute() {
    console.log("After Greet\n");
  }
}

@After(AfterAll)
@Controller("app")
class AppController {
  @After(AfterGreet)
  @OnInvoke("foo")
  async foo() {
    console.log("foo\n");
    return "foo";
  }

  @OnInvoke("bar")
  async bar() {
    console.log("bar\n");
    return "bar";
  }
}
```

En el ejemplo anterior si se hace una llamada IPC con el metodo invoke a `app:foo` se mostrará en consola lo sigiente:

```bash
 > foo
   After all
   After Greet

```

Y si la llamada se hace a `app:bar` se mostraría lo siguiente:

```bash
 > bar
   After all
```

## Decorador `@Headers`

El decorador `@Headers` se utiliza para inyectar los encabezados de una solicitud IPC en un parámetro del método del controlador. Este decorador es útil cuando necesitas acceder a información adicional enviada en los encabezados de la solicitud.

### Uso Básico

```typescript
import { Controller, OnInvoke, Headers } from "electron-di";

@Controller("app")
class AppController {
  @OnInvoke("greet")
  async greet(@Headers() headers: any) {
    console.log("Headers recibidos:", headers);
    return `Hello with headers!`;
  }
}
```

## Decorador `@Inject`

El decorador `@Inject` se utiliza para inyectar dependencias específicas en el constructor de una clase. Es especialmente útil cuando necesitas especificar qué implementación concreta debe ser inyectada para una dependencia abstracta.

### Uso Básico

```typescript
import { Injectable, Inject } from "electron-di";

@Injectable()
class UserService {
  constructor(@Inject(DatabaseService) private database: Database) {}
}
```

## Decorador `@IPCEvent`

El decorador `@IPCEvent` se utiliza para inyectar el objeto evento IPC de Electron en un parámetro del método del controlador. Este decorador te permite acceder a información del evento IPC como el sender.

### Uso Básico

```typescript
import { Controller, OnInvoke, IPCEvent } from "electron-di";
import { IpcMainInvokeEvent } from "electron";

@Controller("app")
class AppController {
  @OnInvoke("greet")
  async greet(@IPCEvent() event: IpcMainInvokeEvent) {
    console.log("Sender:", event.sender);
    return `Hello from ${event.sender.id}!`;
  }
}
```

## Decoradores `@OnInvoke` y `@OnSend`

Estos decoradores se utilizan para marcar métodos que manejarán eventos IPC específicos:

- `@OnInvoke`: Para manejar eventos que requieren una respuesta (ipcMain.handle)
- `@OnSend`: Para manejar eventos unidireccionales (ipcMain.on)

### Uso Básico

```typescript
import { Controller, OnInvoke, OnSend } from "electron-di";

@Controller("app")
class AppController {
  @OnInvoke("greet")
  async greet() {
    return "Hello!";
  }

  @OnSend("notification")
  handleNotification() {
    console.log("Notificación recibida");
  }
}
```

## Decorador `@Payload`

El decorador `@Payload` se utiliza para inyectar los datos enviados en la solicitud IPC en un parámetro del método del controlador.

### Uso Básico

```typescript
import { Controller, OnInvoke, Payload } from "electron-di";

@Controller("app")
class AppController {
  @OnInvoke("greet")
  async greet(@Payload() data: { name: string }) {
    return `Hello ${data.name}!`;
  }
}
```

## Decorador `@Response`

El decorador `@Response` se utiliza para inyectar el objeto de respuesta en un parámetro del método del controlador, permitiendo un control más granular sobre la respuesta enviada al proceso renderer.

### Uso Básico

```typescript
import { Controller, OnInvoke, Response } from "electron-di";

@Controller("app")
class AppController {
  @OnInvoke("greet")
  async greet(@Response() res: any) {
    res.send("Hello!");
  }
}
```

## Autor

- [ajorgenmarten](https://www.github.com/ajorgenmarten)
