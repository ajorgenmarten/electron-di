import ReflectionHandler from "../core/ReflectionHandler"
import { Class, InjectableMetadata } from "../types"

export function Injectable(options: InjectableMetadata = { scope: 'singleton' }): ClassDecorator {
    return function (target: Object) {
        ReflectionHandler.setInjectableMetadata(options, target as Class)
    }
}