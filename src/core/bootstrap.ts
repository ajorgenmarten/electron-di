import { Class } from "./general.types";
import symbols from "./constants";
import { Container } from "./container";

export function Bootstrap(module: Class) {
  const container = new Container();
  container.registerModule(module);
  const controllers = container.Modules.map((module) => module.Controllers)
    .flat()
    .map((controller) => container.resolve(controller.Token));
}
