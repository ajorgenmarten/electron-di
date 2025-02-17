import symbols from "./constants";

type decorators = keyof typeof symbols;

/**
 * Se asegura que no se han aplicado decoradores específicos
 * @param target clase decorada
 * @param decorators arreglo de decoradores a comprobar si se han aplicado
 */
export function HaveNotBeenApplied(target: any, decorators: decorators[]) {
  for (const decorator of decorators) {
    const metadata = Reflect.getMetadata(symbols[decorator], target);
    if (typeof metadata !== "undefined")
      throw new Error(`Ha sido decorado con ${decorator}`);
  }
}

/**
 * Se asegura que se han aplicado decoradores específicos
 * @param target clase decorada
 * @param decorators arreglo de decoradores a comprobar si no se han aplicado
 */
export function HaveBeenApplied(target: any, decorators: decorators[]) {
  for (const decorator of decorators) {
    const metadata = Reflect.getMetadata(symbols[decorator], target);
    if (typeof metadata === "undefined")
      throw new Error(`No se ha aplicado el decorador ${decorator}`);
  }
}
