import { Class } from "./types";
import symbols from "./constants";
import { Container } from "./container";

export function Bootstrap(module: Class) {
  const container = new Container();
  container.registerTreeModule(module);
  container.upControllers();
}
