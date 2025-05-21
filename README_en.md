# **ELECTRON DI**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
[![Electron Version](https://img.shields.io/badge/electron-~30.0.2-blue)](https://www.electronjs.org/)

This project aims to facilitate the creation of cross-platform desktop applications using Electron, combined with a modular and scalable architecture inspired by NestJS. The idea is to leverage backend development best practices like dependency injection, modules, and controllers to build robust and maintainable desktop applications. The approach seeks to simplify development by promoting code reuse and clear structure, ideal for complex projects or teams wanting to apply modern development patterns to desktop applications.

## Key Features

- **Dependency Injection:** The project implements a DI system inspired by frameworks like NestJS, enabling efficient and organized management of application components. This approach facilitates code decoupling, improves testability, and promotes service/module reuse.
- **Modularization:** The project adopts a modular approach organizing the application into independent, cohesive modules following principles similar to NestJS. Each module encapsulates specific functionalities like services, controllers, or utilities.

- **Middlewares:** The project introduces an advanced middleware system for Electron applications, inspired by modern frameworks like NestJS. These middlewares are divided into two key types:
  - **Before Middlewares:** Execute **before** the request reaches the controller method. Ideal for validations, authentication, or pre-processing logic.
  - **After Middlewares:** Execute **after** the controller has processed the request and generated a response. Useful for logging, response transformation, or resource cleanup.

## Installation

To install and use this package, your **Electron** application must be developed with **TypeScript**. This package is designed to integrate with TypeScript projects, leveraging its typing and code safety advantages.

```bash
npm install electron-di
```

After installing, enable experimentalDecorators and emitDecoratorMetadata in your tsconfig.json:

```json
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    /* ... Other tsconfig.json properties */
  }
```

## Decorators

This package provides a set of decorators specifically designed to facilitate dependency injection and module resolution in Electron applications.

## Decorator `@Module`

The `@Module` decorator defines a module in your application - a decorated class that organizes related functionalities like providers, controllers, module dependencies (imports), and exported providers (exports).

### Options of the `@Module` decorator

- `providers` (optional): Array of `@Injectable` classes representing services.

```ts
providers: [
  MyService,
  AnotherService,
  {
    provide: MyAbstractRepository,
    useClass: InMemoryRepository,
  },
];
```

> **`ℹ️ Note:`** You can register services by simply adding the @Injectable class or with a provider object containing provide and useClass.

- `imports` (optional): Array of modules exporting providers needed by this module.

```ts
imports: [OtherModule, AnotherModule];
```

- `controllers` (optional): Array of controllers handling IPC entry points.

```ts
controllers: [SomeController, OtherController];
```

- `exports` (optional): Array of providers to make available to importing modules.

```ts
exports: [MyService, MyAbstractRepository];
```

### Basic usage

```ts
import { Module } from "electron-di";

@Module({
  imports: [OtherModule],
  providers: [MyService],
  controllers: [MyController],
  exports: [MyService],
})
export class MyModule {}
```

### Advanced usage

```ts
import { Injectable, Inject, Controller, Module, OnInvoke } from "electron-di";

abstract class AppRepository {
  abstract getRandomName(): string;
}

@Injectable()
class AppRepositoryImplementation implements AppRepository {
  private names = [
    "Alex",
    "Andrea",
    "Angela",
    "Amanda",
    "John",
    "Mary",
    "Michael",
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

## Decorator `@Injectable`

Marks a class as self-injectable, managed automatically by the DI container.

```ts
import { Injectable } from "electron-di";

@Injectable()
export class ExampleProvider {}
```

## Decorator `@Controller`

Marks a class as an IPC controller. Accepts an optional route prefix.

```ts
import { Controller } from "electron-di";

@Controller()
export class AppController {}

@Controller("some")
export class SomeController {}
```

## Decorator `@Global`

Marks a module as global, making its exported providers available throughout the application.

```ts
import { Module, Global } from "electron-di";

@Global()
@Module({
  providers: [ORMService],
  exports: [ORMService],
})
export class ORMModule {}
```

## `@Before` and `@After` Decorators

Apply middlewares to controller classes/methods for pre/post processing.

```ts
@Before(BeforeMiddleware)
@Controller("app")
class AppController {
  @Before(SpecificMiddleware)
  @OnInvoke("foo")
  async foo() {
    /* ... */
  }
}
```

> **`ℹ️ Note:`** Las clases de middlewares deben implementar un método `execute` que reciba un parámetro de tipo `IMiddlewareContext` y retorne un valor booleano en caso de los que se van a usar como `@Before` y void en caso de los que se van a usar como `@After`.

```ts
import {
  Injectable,
  Inject,
  Controller,
  OnInvoke,
  Headers,
  After,
  Before,
} from "electron-di";
import { Repository } from "./repository";

@Injectable()
class RegisterAction {
  constructor(@Inject(Repository) private repository: Repository) {}

  async execute(@Headers() headers: any) {
    const { userId } = headers;
    await this.repository.traceAction(userId, "StockMovement");
  }
}

@Injectable()
class CanBeDoStockMovement {
  constructor(@Inject(Repository) private repository: Repository) {}

  async execute(@Headers() headers: any) {
    const { userId } = headers;
    const role = await this.repository.getRole(userId);
    if (role !== "Admin") return false;
    return true;
  }
}

@Controller("stock-movement")
class StockMovementController {
  constructor(@Inject(Repository) private repository: Repository) {}

  @After(RegisterAction)
  @Before(CanBeDoStockMovement)
  @OnInvoke("create")
  async create(@Payload() payload: any) {
    const { products, from, to } = payload;
    await this.repository.addStockMovement(products, from, to);
  }
}
```

## `@Inject` Decorator

Injects specific dependencies into a class constructor.

```ts
@Injectable()
class UserService {
  constructor(@Inject(DatabaseService) private database: Database) {}
}
```

## `@IPCEvent` Decorator

Injects the Electron IPC event object.

```ts
@OnInvoke("greet")
async greet(@IPCEvent() event: IpcMainInvokeEvent) {
  console.log("Sender:", event.sender);
}
```

## `@OnInvoke` and `@OnSend` Decorators

Mark methods to handle specific IPC events:

- `@OnInvoke`: For events requiring responses (ipcMain.handle)
- `@OnSend`: For one-way events (ipcMain.on)

```ts
@OnInvoke("greet")
async greet() { return "Hello!"; }

@OnSend("notification")
handleNotification() { console.log("Notification received"); }
```

## `@Payload` Decorator

Injects IPC request data.

```ts
@OnInvoke("greet")
async greet(@Payload() data: { name: string }) {
  return `Hello ${data.name}!`;
}
```

## `@Response` Decorator

Injects the response object for granular response control.

```ts
@OnInvoke("greet")
async greet(@Response() res: any) {
  res.send("Hello!");
}
```

## Comunicación desde el proceso renderer

La comunicación desde el proceso renderer se realiza mediante la función `ipcRenderer.invoke` de Electron o `ipcRenderer.send` para enviar un mensaje a un método del controlador.

```ts
// In the renderer process...
function sendPing() {
  const resonse = await window.electron.ipcRenderer.invoke("app:test", {
    headers: { userId: "123" },
    payload: { name: "John" },
  });
}
```

## Autor

- [ajorgenmarten](https://www.github.com/ajorgenmarten)
