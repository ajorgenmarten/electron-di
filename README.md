# ELECTRON DI

![License](https://img.shields.io/badge/license-MIT-blue.svg)
[![Electron Version](https://img.shields.io/badge/electron->=30.0.2-blue)](https://www.electronjs.org/)

Este proyecto tiene como objetivo facilitar la creación de aplicaciones de escritorio multiplataforma utilizando Electron, combinado con una arquitectura modular y escalable inspirada en NestJS. La idea es aprovechar las mejores prácticas de desarrollo backend, como la inyección de dependencias, módulos y controladores, para construir aplicaciones de escritorio robustas y mantenibles. El enfoque busca simplificar el desarrollo, promoviendo la reutilización de código y una estructura clara, ideal para proyectos complejos o equipos que deseen aplicar patrones modernos de desarrollo en aplicaciones de escritorio.

## Características principales de esta talla

- **Inyección de dependencias:** El proyecto implementa un sistema de inyección de dependencias inspirado en frameworks como NestJS, permitiendo una gestión eficiente y organizada de los componentes de la aplicación. Este enfoque facilita la desacoplamiento del código, mejora la testabilidad y promueve la reutilización de servicios y módulos. Con la DI, los desarrolladores pueden definir y administrar dependencias de manera centralizada, simplificando el mantenimiento y escalabilidad de las aplicaciones de Electron.

- **Modularización:** El proyecto adopta un enfoque de modularización que organiza la aplicación en módulos independientes y cohesivos, siguiendo principios similares a los de NestJS. Cada módulo encapsula funcionalidades específicas, como servicios, controladores o utilidades, lo que facilita la organización del código y su mantenimiento. Esta estructura modular permite a los desarrolladores escalar la aplicación de manera eficiente, reutilizar componentes y mantener un flujo de trabajo claro y ordenado.

- **Middlewares:** El proyecto introduce un sistema avanzado de middlewares para aplicaciones de Electron, inspirado en frameworks modernos como NestJS. Estos middlewares se dividen en dos tipos clave:

  - **Middlewares Before:** Se ejecutan **antes** de que la solicitud llegue al método del controlador. Son ideales para validaciones, autenticación o lógica previa. Si algún middleware before falla, se detiene la ejecución y no se llega al controlador.
  - **Middlewares After:** Se ejecutan **después** de que el controlador ha procesado la solicitud y ha generado una respuesta. Son útiles para tareas como logging, transformación de respuestas o limpieza de recursos.

  Esta dualidad permite un control granular sobre el flujo de la aplicación, brindando flexibilidad y potencia para manejar escenarios complejos en aplicaciones de escritorio.
