const injectable = Symbol("electron-di:injectable");
const controller = Symbol("electron-di:controller");
const module = Symbol("electron-di:module");
const global = Symbol("electron-di:global");
const ipcmethod = Symbol("electron-di:ipc-method");
const inject = Symbol("electron-di:inject");
const paramsArg = Symbol("electron-di:params-args");
const middlewares = Symbol("electron-di:middlewares");

const INJECTION_SYMBOLS = {
  global,
  injectable,
  controller,
  module,
  inject,
  middlewares,
  ipcmethod,
  paramsArg,
};

export default INJECTION_SYMBOLS;
