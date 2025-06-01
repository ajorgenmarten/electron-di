import { Class } from "../types";
import { DependencyContainer } from "./Container";

class App {
    constructor(
        private container: DependencyContainer
    ) {}

    
}

export class ElectronDI {

    static createApp(initModule: Class) {
        
        return new App(new DependencyContainer(initModule))

    }
}
