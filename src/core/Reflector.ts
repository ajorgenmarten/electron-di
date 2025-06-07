import { MetadataHandler } from "./MetadataHandler";
import { Class } from "./types";

export class Reflector {
    constructor(private cls: Class, private handler?: string) {}

    get(key: string) {
        if (this.handler) return MetadataHandler.get(key, { cls: this.cls, method: this.handler})
        return MetadataHandler.get(key, { cls: this.cls.constructor as Class })
    }

    getInControllerContext(key: string) {
        return MetadataHandler.get(key, { cls: this.handler ? this.cls.constructor as Class : this.cls })
    }
    
    getAllMerged(key: string) {
        if (this.handler) {
            const handlerMetadata = MetadataHandler.get(key, { cls: this.cls, method: this.handler })
            const controllerMetadata = MetadataHandler.get(key, { cls: this.cls.constructor as Class})
            return [controllerMetadata, handlerMetadata]
        }
        else return MetadataHandler.get(key, { cls: this.cls })
    }
}