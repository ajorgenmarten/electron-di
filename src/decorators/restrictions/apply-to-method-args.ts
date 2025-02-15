export function ApplyToMethodArgs(propertyKey: any, decoratorName: string) {
    if (typeof propertyKey === 'undefined') throw new Error(`El decorador "${decoratorName}" solo puede aplicarse a argumentos`);
}