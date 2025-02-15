/**
 * Se asegura que el decorador se aplica a una clase
 * @param target Objeto a evaluar como una clase
 * @param decoratorName Nombre del decorador
 */
export function ApplyToClass(target: any, decoratorName: string) {
    if (typeof target !== "function") throw new Error("El decorador \"" + decoratorName + "\" solo puede aplicarse a clases");
}