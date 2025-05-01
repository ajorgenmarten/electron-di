import { InjectMetadata } from "@typedefs/metadata.types";
import { Token } from "@typedefs/general.types";
import symbols from "@core/constants";

/**
 * Decorador para inyección de dependencias en parámetros del constructor.
 * @template T - Tipo del token a inyectar
 * @param token - Token que representa la dependencia a inyectar
 * @returns Decorador de parámetro
 */
export function Inject<T>(token: Token<T>): ParameterDecorator {
  if (!token) {
    throw new Error("El token de inyección no puede ser null o undefined");
  }

  return (
    target: Object,
    propertyKey: string | symbol | undefined,
    paramIndex: number
  ): void => {
    const metadata: InjectMetadata = Reflect.getMetadata(
      symbols.inject,
      target
    ) ?? {
      constructorArgs: [],
    };

    if (!Array.isArray(metadata.constructorArgs)) {
      metadata.constructorArgs = [];
    }

    metadata.constructorArgs[paramIndex] = token;
    Reflect.defineMetadata(symbols.inject, metadata, target);
  };
}
