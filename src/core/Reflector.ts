import { Class } from "../types";
import { SYMBOLS } from "./Symbols";

export class Reflector {
    constructor(private target: Class, private propertyKey?: string | undefined) {}

    getClassMetadata(key: string) {
        const metadata = Reflect.getMetadata(SYMBOLS.reflector, this.target) || {}
        return metadata[key]
    }

    getHandlerMetadata(key: string) {
        if (!this.propertyKey) return undefined
        const metadata = Reflect.getMetadata(SYMBOLS.reflector, this.target.prototype, this.propertyKey) || {}
        return metadata[key]
    }

    getMetadata(key: string) {
        const handler_metadata = this.getHandlerMetadata(key)
        if (handler_metadata) return handler_metadata
        const class_metadata = this.getClassMetadata(key)
        return class_metadata
    }

    getAllOverrideMetadata(key: string) {
        const handler_metadata = this.getHandlerMetadata(key)
        const class_metadata = this.getClassMetadata(key)
        return [handler_metadata, class_metadata]
    }
    
    updateContext(target: Class, propertyKey?: string | undefined) {
        this.target = target
        this.propertyKey = propertyKey
    }
}