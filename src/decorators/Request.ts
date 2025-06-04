import ReflectionHandler from "../core/ReflectionHandler"
import { Class } from "../types"

export function Request(): ParameterDecorator {
    return function (target, propertyKey, paramIndex) {
        ReflectionHandler.setParamMetadata('request', target as Class, propertyKey as string, paramIndex)
    }
}