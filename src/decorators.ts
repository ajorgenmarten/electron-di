import { CLASS_METADATA_KEY } from "./constants"
import { IAbstractClass, IClass, IDecorateMetadata, IElectronMetadataItem, IModuleOptions } from "./types"

export function Inject(token: IClass | IAbstractClass) {
    return function (target: IClass, _propertyKey: string | undefined, paramIndex: number) {
        let metadata: IDecorateMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, target);

        if (metadata === undefined) {
            metadata = { dependencies: [], type: 'provider' };
        }
        
        if (!Array.isArray(metadata.dependencies)) {
            metadata.dependencies = [];
        }
        
        metadata.dependencies[paramIndex] = token;
        
        Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target);
    }
}

export function Injectable() {
    return function (target: IClass) {
        const setMetadata: IDecorateMetadata = { type: 'provider' }
        let metadata: IDecorateMetadata | undefined = Reflect.getMetadata(CLASS_METADATA_KEY, target)
        metadata = metadata === undefined ? setMetadata : { ...metadata, ...setMetadata };
        Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target)
    }
}

export function Controller(prefix?: string) {
    return function (target: IClass) {
        const setMetadata: IDecorateMetadata = { type: 'controller', prefix }
        let metadata: IDecorateMetadata | undefined = Reflect.getMetadata(CLASS_METADATA_KEY, target)
        metadata = metadata === undefined ? setMetadata : { ...metadata, ...setMetadata };
        Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target)
    }
}

export function OnInvoke(channel: string) {
    return function (target: any, propertyKey: string) {
        const decorate: IElectronMetadataItem = { channel, method: propertyKey, type: 'invoke' }
        let metadata: IDecorateMetadata | undefined = Reflect.getMetadata(CLASS_METADATA_KEY, target)
        if (metadata === undefined) {
            metadata = { type: 'controller', decorates: [decorate]}
            Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target)
        } else {
            if (metadata.decorates === undefined) metadata.decorates = []
            metadata.decorates.push(decorate)
            Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target)
        }
    }
}

export function OnSend(channel: string) {
    return function (target: any, propertyKey: string) {
        const decorate: IElectronMetadataItem = { channel, method: propertyKey, type: 'send' }
        let metadata: IDecorateMetadata | undefined = Reflect.getMetadata(CLASS_METADATA_KEY, target)
        if (metadata === undefined) {
            metadata = { type: 'controller', decorates: [decorate]}
            Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target)
        } else {
            if (metadata.decorates === undefined) metadata.decorates = []
            metadata.decorates.push(decorate)
            Reflect.defineMetadata(CLASS_METADATA_KEY, metadata, target)
        }
    }
}

export function Module(options: IModuleOptions) {
    return function (target: IClass) {
        const setMetadata: IDecorateMetadata = { type: 'module', options }
        Reflect.defineMetadata(CLASS_METADATA_KEY, setMetadata, target)
    }
}