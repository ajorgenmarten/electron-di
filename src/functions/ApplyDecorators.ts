import { After, Before } from "../decorators"

export function applyDecorator(...decorators: (ClassDecorator | MethodDecorator)[]) {
    let sortedDecorators: (ClassDecorator | MethodDecorator)[] = []
    for (const decorator of decorators) {
        if (decorator instanceof After || decorator instanceof Before)
            sortedDecorators = [decorator, ...sortedDecorators]
        else sortedDecorators.push(decorator)
    }
    return (target: Object | Function, property?: string | undefined, descriptor?: PropertyDescriptor) => {
        for(const decorator of sortedDecorators) {
            if (!property && !descriptor) {
                (decorator as ClassDecorator)(target as Function)
            }
            if (descriptor && typeof descriptor !== 'number') {
                (decorator as MethodDecorator)(target, property as string, descriptor)
            }
        }
    }
}