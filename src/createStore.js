import {ReplaySubject} from 'rx';
import {fromJS} from 'immutable';
import {createAction} from './createAction';

const defaultCombinator = (state, data) => state.merge(data);

export const createStore = ({streams, defaultState, combinator = defaultCombinator}) => {
    // convert default state to immutable if needed
    const immutableState = fromJS(defaultState);
    // create result store stream
    const subj = new ReplaySubject(1);

    // create clean action
    const clear = createAction();
    clear.$.map(() => immutableState).subscribe(subj);
    // plug in user actions
    streams.map(s$ => s$
        .map(fromJS)
        .subscribe(subj)
    );

    // init stream
    const store = subj
    // start with default state
    .startWith(immutableState)
    // combine results
    .scan(combinator);

    // append clear method
    store.clear = clear;

    return store;
};
