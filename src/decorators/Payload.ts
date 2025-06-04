import ReflectionHandler from "../core/ReflectionHandler"
import { Class } from "../types"

export function Payload(): ParameterDecorator {
    return function (target, propertyKey, paramIndex) {
        ReflectionHandler.setParamMetadata('payload', target as Class, propertyKey as string, paramIndex)
    }
}