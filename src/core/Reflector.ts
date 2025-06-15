import { MetadataHandler } from "./MetadataHandler";
import { Class } from "./types";

export class Reflector {
    constructor(private cls: Class, private handler?: string) {}

    get(key: string) {
        if (this.handler) return MetadataHandler.GetSetMetadata(this.cls.constructor as Class, key, this.handler)
        return MetadataHandler.GetSetMetadata(this.cls, key)
    }

    getInControllerContext(key: string) {
        return MetadataHandler.GetSetMetadata(this.handler ? this.cls.constructor as Class : this.cls, key)
    }
    
    getAllMerged(key: string) {
        if (this.handler) {
            const handlerMetadata = MetadataHandler.GetSetMetadata(this.cls.constructor as Class, key, this.handler)
            const controllerMetadata = MetadataHandler.GetSetMetadata(this.cls.constructor as Class, key)
            return [controllerMetadata, handlerMetadata]
        }
        else return [MetadataHandler.GetSetMetadata(this.cls, key)]
    }
}