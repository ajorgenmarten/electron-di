import { Class, MetadataHandler } from "../core"


export function Request(): ParameterDecorator {
    return function (target, propertyKey, paramIndex) {
        MetadataHandler.SetParamsMetadata(target as Class, propertyKey as string, paramIndex, 'event')
    }
}