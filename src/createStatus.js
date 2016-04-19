import {createAction} from './createAction';
import {fromJS} from 'immutable';

// create status action
export const createStatus = (statusKey = 'status') => {
    const status = createAction();
    status.$ = status.$.map(s => fromJS({[statusKey]: s}));
    return status;
};
