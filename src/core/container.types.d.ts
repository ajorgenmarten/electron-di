import { Class, Token } from "./general.types";

interface IComponent {
  Token: Token;
  UseClass: Class;
}

interface IController extends IComponent {
  Prefix: string;
}

interface IModule {
  Class: Class;
  Controllers: IController[];
  Providers: IComponent[];
  Imports: Class[];
  Exports: Token[];
  Instances: Map<Token, InstanceType<Token>>;
  IsGlobal: boolean;
  resolve<T>(token: Token<T>): InstanceType<Token<T>> | null;
}

interface IContainer {
  Modules: IModule[];
  resolve(token: Token): InstanceType<Token>;
}

interface ILinkObject {
  findInGlobalModules(token: Token): InstanceType<Token> | null;
  findInSharedModules(
    token: Token,
    modules: Class[]
  ): InstanceType<Token> | null;
}

export { IComponent, IController, IModule, IContainer, ILinkObject };
