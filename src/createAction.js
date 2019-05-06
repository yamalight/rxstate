import {Subject} from 'rxjs';

export const createAction = () => {
  const bus = new Subject();
  const creator = val => bus.next(val);
  creator.$ = bus;
  return creator;
};
