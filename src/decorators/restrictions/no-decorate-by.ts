export function NoDecorateBy(target: any, decoratorName: string, ...symbolsMetadata: symbol[]) {
    for(const symbol of symbolsMetadata) {
        const metadata = Reflect.getMetadata(symbol, target)
        if (metadata === undefined) continue
        throw new Error("No puedes decorar la clase " + target.name + " con " + decoratorName)
    }
}