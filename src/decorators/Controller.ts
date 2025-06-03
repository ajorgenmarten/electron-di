import ReflectionHandler from "../core/ReflectionHandler"
import { Class, ControllerMetadata } from "../types"

export function Controller(prefix?: string): ClassDecorator {
    return function (target: Object) {
        const metadata: ControllerMetadata = { prefix: prefix ?? "" }
        ReflectionHandler.setControllerMetadata(metadata, target as Class)
    }
}