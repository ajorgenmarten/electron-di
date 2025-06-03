import { Class, Provider, Token } from "../types";
import { DependencyContainer } from "./Container";
import ReflectionHandler from "./ReflectionHandler";

class App {
    constructor(private container: DependencyContainer) { }

    get Container() {
        return this.container;
    }
}

export class ElectronDI {
    static createApp(MainModule: Class) {
        const app = new App(new DependencyContainer(MainModule))
        return app;
    }
}
