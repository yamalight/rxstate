import {Subject, ReplaySubject} from 'rxjs/Rx';
import {fromJS} from 'immutable';
import {createAction} from './createAction';

const defaultCombinator = (state, data) => state.merge(data);

export const createStore = ({streams, defaultState, combinator = defaultCombinator}) => {
    // convert default state to immutable if needed
    const immutableState = fromJS(defaultState);
    // create result store stream
    const subj = new Subject();

    // create clean action
    const clear = createAction();
    clear.$.map(newData => (newData ? fromJS(newData) : immutableState)).subscribe(subj);
    // plug in user actions
    streams.map(s$ => s$.map(val => fromJS(val)).subscribe(subj));

    // init result stream
    const store = new ReplaySubject(1);
    // start with default state
    subj.startWith(immutableState)
        // combine results
        .scan(combinator)
        // push result to final stream
        .subscribe(store);

    // append clear method
    store.clear = clear;

    return store;
};
