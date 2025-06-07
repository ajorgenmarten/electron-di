import { Class, InjectableMetadata, MetadataHandler } from "../core"

export function Injectable(options?: InjectableMetadata): ClassDecorator {
    return function (target: Object) {
        MetadataHandler.SetInjectableMetadata(target as Class, { scope: 'singleton', ...options })
    }
}