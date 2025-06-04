import ReflectionHandler from "../core/ReflectionHandler"
import { Class } from "../types"

export function Event(): ParameterDecorator {
    return function(target, propertyKey, paramIndex) {
        ReflectionHandler.setParamMetadata('event', target as Class, propertyKey as string, paramIndex)
    }
}