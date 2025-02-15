import { Class, Token } from "./types";

class ModuleContext {
    private readonly providers: Map<Token, Class> = new Map();
    private readonly instances: Map<Token, any> = new Map();
    

}

export class DependencyContainer {
    /**
     * Contexto de módulos.
     */
    private readonly modules: Map<Token, ModuleContext> = new Map();
    /**
     * Modulos globales en toda la aplicación.
     * Estos modulos no tienen que ser importados explicitamente en otro módulo.
     */
    private readonly globals: Map<Token, Class> = new Map(); 
}