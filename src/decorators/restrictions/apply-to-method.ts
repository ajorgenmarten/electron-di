export function ApplyToMethod(target: any, descriptor: any, decoratorName: string) {
    if (typeof target === 'function' || typeof descriptor === 'undefined') throw new Error("El decorador \"" + decoratorName + "\" solo puede aplicarse a métodos");
}