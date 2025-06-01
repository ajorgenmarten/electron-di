export function applyDecorators(...decorators: (ClassDecorator | MethodDecorator )[] ): ClassDecorator | MethodDecorator {
    return function (target, propertyKey, propertyDescriptor) {
        for(const decorator of decorators) {
            (decorator as MethodDecorator)(target, propertyKey, propertyDescriptor)
        }
    }
}