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