export function OnInvoke(channel: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
      return method.apply(this, [channel, ...args]);
    };
  };
}
