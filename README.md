# 💉 electron-di

`electron-di` mejora la gestión de dependencias en aplicaciones Electron, facilitando la inyección de servicios y la modularidad del código. Permite desacoplar componentes y simplificar pruebas, haciendo el desarrollo más mantenible y escalable.

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

### Ejemplo de uso

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