export function ApplyToConstructorArgs(target: any, propertyKey: string | undefined, paramIndex: number, decoratorName:string) {
    if (typeof target === 'function') throw new Error("El decorador \"" + decoratorName + "\" solo puede aplicarse a argumenyos de constructores");
    if (typeof propertyKey !== 'undefined') throw new Error("El decorador \"" + decoratorName + "\" solo puede aplicarse a argumenyos de constructores");
    if (typeof paramIndex !== 'number') throw new Error("El decorador \"" + decoratorName + "\" solo puede aplicarse a argumentos");
}