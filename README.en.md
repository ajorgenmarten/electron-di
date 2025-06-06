# 💉 electron-di

`electron-di` enhances dependency management in Electron applications, facilitating service injection and code modularity. It allows decoupling components and simplifying tests, making development more maintainable and scalable.

## Translations

Traducción a [Español](https://github.com/ajorgenmarten/electron-di/blob/main/README.md)

## Installation

```bash
npm install electron-di
```

O usando Yarn:

```bash
yarn add electron-di
```

> **Note:**  
> If you're using Vite, you'll also need to install `@swc/core` and configure the corresponding plugin in your Vite configuration file:
>
> ```bash
> npm install @swc/core --save-dev
> ```
>
> Then, add the SWC plugin in your `vite.config.js` or `vite.config.ts` according to the Vite documentation and the plugin you are using.

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

## Configuration

Enable decorators in tsconfig.json. To use this package correctly, you must enable decorators in your `tsconfig.json` file

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    // ... otras opciones
  }
}
```

## Basic Usage

```js
import { ElectronDI } from 'electron-di';
import AppModule from './app.module.ts'

// ...
ElectronDI.createApp(AppModule)
//...
```

## 🧩 Working with Modules in electron-di

The module system in electron-di allows you to organize your application into reusable components. Here is the correct documentation:

### Basic Structure

To create a module, use the `@Module()` decorator with the following structure:

```ts
@Module({
    imports: [], // Other modules you want to import
    controllers: [], // Controllers that belong to this module
    providers: [], // Services that belong to this module
    exports: [] // Providers you want to make available to other modules
})
export class AppModule {}
```

### Example:

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

### Global Modules

You can make a module globally accessible using the `@Global()` decorator. When a module is marked as global, all providers it exports will be available to any other module in the application without needing to explicitly import them:

```ts
@Global()
@Module({
    providers: [CommonService],
    exports: [CommonService]
})
export class CommonModule {}
```

Dependency injection is handled automatically through the DI container when you initialize your application with `ElectronDI.createApp(AppModule)`.

This allows you to:
- Organize your code into cohesive modules
- Reuse functionality across different parts of your application
- Maintain loose coupling between components
- Manage service scope (global vs module-specific)
- Facilitate unit testing

## Controllers

### 🦩 What is a Controller?

In this framework, a Controller is a class that groups methods for handling IPC events `(ipcMain)` in Electron. It defines logical channels where communication is received from the renderer process.

🔧 Decorator: `@Controller('optionalPrefix')`

```ts
import { Controller } from 'electron-di';

@Controller('user')
export class UserController {
    // Methods
}
```
The prefix defines the "namespace" for all channels handled by that controller.

### 🚀 How to Handle IPC Events

There are two decorators for binding methods to events:

| Decorator  | Event Type    | Description                              |
|------------|---------------|------------------------------------------|
|`@OnInvoke`|`ipcMain.handle`|Promise-based communication (`invoke`)    |
|`@OnSend`  |`ipcMain.on`    |Emit-style communication (`no response`)  |

#### Example:
```ts
import { Controller, OnInvoke, OnSend, Event, Payload } from 'electron-di';

@Controller('user')
export class UserController {
  
    @OnInvoke('create')
    async createUser(@Event() event, @Payload() payload) {
        // creation logic
        return { success: true, data: payload };
    }

    @OnSend('notify')
    notifyUser(@Event() event, @Payload() payload) {
        // notification logic
    }
}
```

#### Result:
- user:create → handled with invoke
- user:notify → handled with on

## 🛠️ Parameter Decorators

Methods can receive automatic injections of certain values according to the decorator:

| Decorator | Parameter                                   | Type                                    |
|-----------|---------------------------------------------|-----------------------------------------|
|`@Event`   |Electron Event                               |`IpcMainEvent` or `IpcMainInvokeEvent`   |
|`@Payload` |Data sent from renderer (arg[0])             |`any`                                    |
|`@Request` |Complete context object `{ event, payload }` |`ExecutionContext` (`{ event, payload }`)|

## 🛡️ Guards

Guards are classes that allow validating or intercepting execution before or after handling an event. They are especially useful for implementing authentication mechanisms, authorization, data validation, or any logic before and after controller execution.

### Types of Guards

| Decorator | When it executes                            | Type                                                                        |
|-----------|---------------------------------------------|-----------------------------------------------------------------------------|
|`@Before`  |Before executing the method                  |Synchronous or asynchronous (must return a `boolean` or throw an `exception`)|
|`@After`   |After executing the method                   |Synchronous or asynchronous (is of type `void`)                              |

Guards can be applied:
- At controller class level (`@Controller`)
- At method level (`@OnSend`, `@OnInvoke`) for more specific control

A Before Guard can prevent controller execution by returning false or throwing an exception.
An After Guard executes after the main method and can perform tasks like logging, metrics, or auditing.

#### Example:

```ts
import { Controller, OnInvoke, Before } from 'electron-di';
import { AuthGuard } from './guards/AuthGuard';
import { AnotherGuard } from './guards/AnotherGuard';

@Before(AuthGuard) // At class level
@Controller('secure')
export class SecureController {

    @OnInvoke('secret')
    @Before(AnotherGuard) // At method level
    async getSecret(@Payload() payload) {
        return { data: 'super-secret-data' };
    }
}
```

## Implementing a Guard

Guards are classes that implement an `execute()` method which can be synchronous or asynchronous. To use them, they must be registered as providers in a module. If you want to use the Guard in other modules, it must be explicitly exported. The `execute()` method must return a boolean value that determines whether the controller execution is allowed or not.

### 1. Creating the Guard Class

The class must:
- Use the `@Injectable()` decorator
- Implement an `execute()` method
- Return `boolean` or `Promise<boolean>`
- Optionally, throw exceptions for error handling

### 2. Basic Structure

```ts
@Injectable()
export class AuthGuard {
    async execute(@Payload() payload) {
        if (!payload.token) return false;
        // Validate token or perform security logic
        return true;
    }
}
```

### Dependency Injection in Guards

Guards are also decorated with `@Injectable`, which means they can have dependency injection just like a service or controller. This allows you to build more complex Guards that depend on other services like databases, authentication, etc.

Additionally, the execute method parameters can be automatically resolved using decorators:

- @Event() for the Electron event.
- @Payload() for the sent payload.
- @Request() for the complete context object.

## 🧬 Dependency Injection — `@Injectable`

The `@Injectable` decorator marks a class as injectable, allowing the dependency container to create instances of it and automatically resolve its dependencies.

When a class is decorated with `@Injectable`, you can:
- Inject other classes also decorated as `@Injectable`.
- Manage lifecycle: singleton by default.
- Simplify the construction and maintenance of complex services and guards.

### Advantages of `@Injectable`

- Automatic injection: The framework detects constructor parameters and resolves them automatically.
- Controlled lifecycle: By default, instances are singletons, ensuring only one instance is created for the entire application.
- Use anywhere: Services (`Service`), Guards (`Guard`), Repositories (`Repository`) can be injectable.

#### Example:

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

## 🔧 Advanced Utilities: applyDecorator and SetMetadata

`applyDecorator`
This function allows combining multiple decorators (`ClassDecorator` or `MethodDecorator`) in a single call, improving code readability.

#### Example:
```ts
import { applyDecorator, Controller, Before } from 'electron-di';

@applyDecorator(
  Controller('admin'),
  Before(AuthGuard)
)
export class AdminController {
    // Methods here
}
```

`SetMetadata`
`SetMetadata` allows associating custom information (metadata) to classes or methods. This is useful, for example, to set permissions, roles, or any extra configuration.

#### Example:
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

#### Example using utilities:
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
    // execute logic...
    return true
  }
}

// guards/AuthGuard
import { Injectable, Guard, Reflector } from 'electron-di'

// The scope is defined as transient because
// when accessing the Reflector class, we need
// a new instance each time to correctly obtain
// the metadata defined at controller or handler level.
// This ensures proper metadata resolution
// across different execution contexts.
@Injectable({ scope: 'transient' })
export default class RolesGuard implements Guard {
  constructor(private readonly reflector: Reflector) {}
  async execute(@Payload() payload) {
    const roles = reflector.getMetadata('roles')
    // execute logic...
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

  // This decorator provides a security layer
  // by validating user authentication and verifying
  // if they have the required roles.
  // It combines both AuthGuard and RolesGuard
  // into a single decorator for cleaner implementation.
  @Roles(['admin'])
  async getLogs(@Payload() payload: LogsPagination) {
    return await this._service.getLogs(payload)
  }
}
```

Created with ❤️ by [Alejandro Jorgen Martén](https://github.com/ajorgenmarten)

