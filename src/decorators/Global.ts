import ReflectionHandler from "../core/ReflectionHandler"
import { Class } from "../types"

export function Global(): ClassDecorator {
    return function (target: Object) {
        ReflectionHandler.setGlobalMetadata(true, target as Class)
    }
}