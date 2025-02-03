import { INJECT_CONSTRUCTOR } from "./constants"
import { IClass, IInjectMetadata } from "./types"

class DependencyInjector {
    private readonly container: Map<string, IClass> = new Map()
    register(token: string, cls: IClass) {
        if(this.container.has(token)) return
        this.container.set(token, cls)
    }
    resolveDepenedency(token: string) {
        if(!this.container.has(token))
            throw new Error(`Dependency for [${token}] not found.`)
        
        const cls = this.container.get(token)
        if (!cls) throw new Error(`Dependency [${token}] not found`)
        const clsInjectMetadata: IInjectMetadata | undefined = Reflect.getMetadata(INJECT_CONSTRUCTOR, cls)
        if (!clsInjectMetadata) return new cls()
        const instances: IClass[] = clsInjectMetadata.constructParams.map((cls) => this.resolveDepenedency(cls.name))
        return new cls(...instances)
    }
    updateToken(token: string, cls: IClass) {
        if (!this.container.has(cls.name))
            throw new Error(`Dependecy [${cls.name}] has been not injected. Use ''@Injectable()'' decorator in class ''${cls.name}''`)
        this.container.delete(cls.name)
        this.container.set(token, cls)
    }
    get Container() {
        return this.container
    }
}

export const container = new DependencyInjector()