import {Subject} from 'rxjs/Rx';

export const createAction = () => {
    const bus = new Subject();
    const creator = val => bus.next(val);
    creator.$ = bus;
    return creator;
};
