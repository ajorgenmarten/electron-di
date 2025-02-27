# ELECTRON DI

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

## Tabla de Contenidos

1. [Decoradores](#descripción)
2. [Decoradores de clases](#características-principales)
3. [Decoradores de metodos](#requisitos-previos)
4. [Decoradores de argumentos](#instalación)
5. [Uso](#uso)

## Decoradores

Este paquete proporciona un conjunto de decoradores diseñados específicamente para facilitar la inyección de dependencias y la resolución de módulos de Electron. Estos decoradores te permiten gestionar de manera eficiente las dependencias de tu aplicación y acceder a los módulos principales de Electron (main y renderer) de forma segura y organizada.

## Decoradores de clase

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

    ```typescript
    import {
      Injectable,
      Inject,
      Controller,
      Module,
      OnInvoke,
    } from "electron-di";

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
      constructor(
        @Inject(AppService) private readonly appService: AppService
      ) {}

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

## Decorador `@Injectable`

## Autor

- [ajorgenmarten](https://www.github.com/ajorgenmarten)
