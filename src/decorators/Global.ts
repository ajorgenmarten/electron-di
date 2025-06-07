import { Class, MetadataHandler } from "../core"


export function Global(): ClassDecorator {
    return function (target: Object) {
        MetadataHandler.SetGlobalMetadata(target as Class, true)
    }
}