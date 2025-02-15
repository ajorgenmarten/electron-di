import 'reflect-metadata'
import { Class } from '@core/types';

export function logParams(target: Class) {
    const params = Reflect.getMetadata('design:paramtypes', target);
    console.log(params);
}