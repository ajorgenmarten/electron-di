export function ApplyToArguments(paramIndex: number, decoratorName: string) {
    if (typeof paramIndex !== 'number') throw new Error(`El decorador "${decoratorName}" solo puede aplicarse a argumentos`);
}