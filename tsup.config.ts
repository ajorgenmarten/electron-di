import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // Cambia según tu archivo principal
  format: ['cjs', 'esm'],   // Electron puede necesitar CommonJS
  target: 'es2019',         // Para compatibilidad con Electron
  sourcemap: true,          // Útil para debugging
  dts: true,                // Genera archivos .d.ts
  clean: true,              // Limpia la carpeta de salida
  skipNodeModulesBundle: true, // No empaqueta node_modules
  esbuildOptions(options) {
    options.external = ['electron', 'reflect-metadata']; // No empaquetar electron ni reflect-metadata
  },
});
