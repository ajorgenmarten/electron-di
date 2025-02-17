const injectable = Symbol("electron-di:injectable");
const controller = Symbol("electron-di:controller");
const contextmodule = Symbol("electron-di:module");
const global = Symbol("electron-di:global");
const ipcmethod = Symbol("electron-di:ipc-method");
const inject = Symbol("electron-di:inject");
const paramsArg = Symbol("electron-di:params-args");
const middlewares = Symbol("electron-di:middlewares");

const INJECTION_SYMBOLS = {
  global,
  injectable,
  controller,
  module: contextmodule,
  inject,
  before: middlewares,
  after: middlewares,
  onsend: ipcmethod,
  oninvoke: ipcmethod,
  body: paramsArg,
  headers: paramsArg,
  request: paramsArg,
  event: paramsArg,
  response: paramsArg,
};

export default INJECTION_SYMBOLS;
