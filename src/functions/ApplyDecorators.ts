export function applyDecorator(...decorators: (ClassDecorator | MethodDecorator)[]) {
    return (target: Object | Function, property?: string | undefined, descriptor?: PropertyDescriptor) => {
        for(const decorator of decorators) {
            if (!property && !descriptor) {
                (decorator as ClassDecorator)(target as Function)
            }
            if (descriptor && typeof descriptor !== 'number') {
                (decorator as MethodDecorator)(target, property as string, descriptor)
            }
        }
    }
}