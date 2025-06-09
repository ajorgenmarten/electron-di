import { Class, MetadataHandler, ModuleMetadata } from "../core"


export function Module(options: ModuleMetadata): ClassDecorator {
    return function (target: Object) {
        MetadataHandler.SetModuleMetadata(target as Class, options)
    }
}