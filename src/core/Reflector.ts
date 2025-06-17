import { MetadataHandler } from "./MetadataHandler";
import { Class } from "./types";

export class Reflector {
    constructor(private cls: Class, private handler?: string) {}

    get<T>(key: string): T | undefined {
        if (this.handler) return MetadataHandler.GetSetMetadata(this.cls.constructor as Class, key, this.handler)
        return MetadataHandler.GetSetMetadata(this.cls, key)
    }

    getInControllerContext<T>(key: string): T | undefined {
        return MetadataHandler.GetSetMetadata(this.handler ? this.cls.constructor as Class : this.cls, key)
    }
    
    getAllMerged<T>(key: string): Array<T> {
        if (this.handler) {
            const handlerMetadata = MetadataHandler.GetSetMetadata(this.cls.constructor as Class, key, this.handler)
            const controllerMetadata = MetadataHandler.GetSetMetadata(this.cls.constructor as Class, key)
            return [controllerMetadata, handlerMetadata]
        }
        else return [MetadataHandler.GetSetMetadata(this.cls, key)]
    }
}