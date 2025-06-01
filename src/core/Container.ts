import { Class, ControllerMetadata, ModuleMetadata, Provider, Token } from "../types";
import { SYMBOLS } from "./Symbols";

class Injectable {
    public Dependencies: Token[];
    constructor(
        public Value: Class,
        public Provider: Token,
        public Exported: boolean,
        public Instance: Class | null = null
    ) {
        const paramTypes = Reflect.getMetadata('design:paramtypes', this.Value)
        this.Dependencies = paramTypes || []
    }
}

class Controller {
    public Dependencies: Token[];
    constructor(
        public Value: Class,
        public Instance: Class | null = null
    ) {
        const paramTypes = Reflect.getMetadata('design:paramtypes', this.Value)
        this.Dependencies = paramTypes || []
    }
}

class NodeModule {
    constructor(
        public Value: Class,
        public Injectables: Injectable[],
        public Controllers: Controller[],
        public Global: boolean,
        public Branches: NodeModule[],
        public FindInGlobalHook: ((token: Token) => Injectable | null)
    ) {}

    instanceControllers() {
        for(const controller of this.Controllers) {
            if (!controller.Dependencies) {
                controller.Instance = new controller.Value()
                continue;
            }
            const instances = controller.Dependencies.map(dep => this.resolve(dep)?.Instance)
            controller.Instance = new controller.Value(...instances)
        }
    }

    resolve(token: Token, level: number = 1): Injectable | null {
        for(const injectable of this.Injectables) {
            if (injectable.Provider !== token) continue;
            if (injectable.Instance) return injectable
            if (!injectable.Dependencies) {
                injectable.Instance = new injectable.Value()
                return injectable
            }
            const instances: (Injectable | null)[] = injectable.Dependencies.map(dep => this.resolve(dep))
            injectable.Instance = new injectable.Value(...instances)
            return injectable
        }
        if (level == 0) return null
        for(const branch of this.Branches) {
            if (branch.Global) continue;
            const injectable = branch.resolve(token, --level)
            if (!injectable) continue;
            if (!injectable.Exported) return null
            return injectable
        }
        return this.FindInGlobalHook(token);
    }

}

export class DependencyContainer {
    private root: NodeModule;

    constructor(module: Class) {
        this.root = this.getTreeModules(module)
        this.build(this.root)
    }

    private getTreeModules(module: Class) {
        const moduleMetadata = Reflect.getMetadata(SYMBOLS.module, module) as ModuleMetadata | undefined
        if (!moduleMetadata) throw new Error(`Please decore the class "${module.name}" with @Module({})`)
        const globalMetadata = Reflect.getMetadata(SYMBOLS.global, module) as boolean || false
        const nodeModule = new NodeModule(
            module,
            this.getProviders(moduleMetadata.providers, moduleMetadata.exports),
            this.getControllers(moduleMetadata.controllers),
            globalMetadata,
            [], (token: Token) => this.resolveInGlobalHook(token, this.root))
        if (!moduleMetadata.imports) return nodeModule 
        for (const importModule of moduleMetadata.imports)
            nodeModule.Branches.push(this.getTreeModules(importModule))
        return nodeModule
    }

    private getControllers(controllers?: Class[]): Controller[] {
        if (!controllers || controllers.length == 0) return []
        const result = []
        for(const controller of controllers) {
            const controllerMetaData = Reflect.getMetadata(SYMBOLS.controller, controller) as ControllerMetadata | undefined
            if (!controllerMetaData) throw new Error(`Please decore the class "${controller.name}" with @Controller()`)
            const controllerModel = new Controller(controller)
            result.push(controllerModel)
        }
        return result
    }

    private getProviders(providers?: Provider[], exports?: Token[]): Injectable[] {
        if (!providers || providers.length == 0) return []
        const result = []
        for(const provider of providers) {
            const [token, cls] = typeof provider === "object" ? [provider.provided, provider.useClass] : [provider, provider]
            const injectableMetadata = Reflect.getMetadata(SYMBOLS.provider, cls) as boolean
            if (!injectableMetadata) throw new Error(`Please decore the class "${cls.name}" with @Injectable()`)
            const injectableModel = new Injectable(cls, token, exports?.find(e => e === token) ? true : false)
            result.push(injectableModel)
        }
        return result
    }

    private resolveInGlobalHook(token: Token, nodeModule: NodeModule): Injectable | null {
        if (nodeModule.Global) {
            const instance = nodeModule.resolve(token)
            if (instance) return instance
        }
        for (const branch of nodeModule.Branches) {
            const instance = this.resolveInGlobalHook(token, branch)
            if (instance) return instance
        }
        return null        
    }

    private build(root: NodeModule) {
        if (root.Branches)
            for(const branch of root.Branches) this.build(branch)
        root.instanceControllers()
    }
}