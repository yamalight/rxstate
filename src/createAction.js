import {Subject} from 'rx';

export const createAction = () => {
    const bus = new Subject();
    const creator = (val) => bus.onNext(val);
    creator.$ = bus;
    return creator;
};
