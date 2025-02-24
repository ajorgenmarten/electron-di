import { InjectMetadata } from "@core/metadata.types";
import { Token } from "@core/general.types";
import symbols from "@core/constants";

export function Inject(token: Token) {
  return function (
    target: any,
    propertyKey: string | undefined,
    paramIndex: number
  ) {
    const metadata: InjectMetadata = Reflect.getMetadata(
      symbols.inject,
      target
    ) ?? { constructorArgs: [] };
    metadata.constructorArgs[paramIndex] = token;
    Reflect.defineMetadata(symbols.inject, metadata, target);
  };
}
