import { Class, MetadataHandler } from "../core"


export function Event(): ParameterDecorator {
    return function(target, propertyKey, paramIndex) {
        MetadataHandler.SetParamsMetadata(target as Class, propertyKey as string, paramIndex, 'event')
    }
}