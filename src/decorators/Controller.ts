import { Class, ControllerMetadata, MetadataHandler } from "../core"


export function Controller(prefix?: string): ClassDecorator {
    return function (target: Object) {
        const metadata: ControllerMetadata = { prefix: prefix ?? "" }
        MetadataHandler.SetControllerMetadata(target as Class, metadata)
    }
}