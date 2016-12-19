import Rx from 'rxjs/Rx';

export const createAction = () => {
    const bus = new Rx.Subject();
    const creator = (val) => bus.next(val);
    creator.$ = bus;
    return creator;
};
