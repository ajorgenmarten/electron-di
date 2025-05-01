import symbols from "@core/constants";
import { ModuleMetadata, ModuleOptions } from "@typedefs/metadata.types";
import { Class } from "@typedefs/general.types";

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

export function Module(options: ModuleOptions) {
  return function (target: Class) {
    const metadata: ModuleMetadata = { options };
    Reflect.defineMetadata(symbols.module, metadata, target);
  };
}
