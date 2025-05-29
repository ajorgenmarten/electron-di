import { Class } from "../types";
import { DependencyContainer } from "./Container";


export class ElectronDI {
    private static container: DependencyContainer;

    static createApp(initModule: Class) {
        
        this.container = (new DependencyContainer(initModule))

        return this.container;

    }
}
