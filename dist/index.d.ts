interface Class {
    new (...args: any[]): any;
}

declare function logParams(target: Class): void;

export { logParams };
