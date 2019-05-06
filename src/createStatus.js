import {map} from 'rxjs/operators';
import {createAction} from './createAction';

// create status action
export const createStatus = (statusKey = 'status') => {
  const status = createAction();
  status.$ = status.$.pipe(map(s => ({[statusKey]: s})));
  return status;
};
