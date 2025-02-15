/**
 * Verifica que a la clase se le haya aplicado un decorador específico
 * @param target Clase a evaluar
 * @param decoratorName Nombre del decorador que debe aplicarse primero
 * @param decoratorSymbol Symbol del decorador que debe aplicarse primero
 */
export function HasDecorateBy(target: any, decoratorName: string, decoratorSymbol: symbol) {
    const metadata = Reflect.getMetadata(decoratorSymbol, target)
    if (metadata === undefined) throw new Error(`La clase ${target.name} no ha sido decorada con ${decoratorName}`)
}