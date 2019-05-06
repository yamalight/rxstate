import {Subject, ReplaySubject} from 'rxjs';
import {map, startWith, scan} from 'rxjs/operators';
import {createAction} from './createAction';

const defaultCombinator = (state, data) => ({...state, ...data});

export const createStore = ({streams, defaultState, combinator = defaultCombinator}) => {
  // create result store stream
  const subj = new Subject();

  // create clean action
  const clear = createAction();
  clear.$.pipe(map(newData => (newData ? {...newData} : {...defaultState}))).subscribe(subj);
  // plug in user actions
  streams.map(s$ => s$.subscribe(subj));

  // init result stream
  const store = new ReplaySubject(1);
  // start with default state
  subj
    .pipe(
      startWith({...defaultState}),
      // combine results
      scan(combinator)
    )
    // push result to final stream
    .subscribe(store);

  // append clear method
  store.clear = clear;

  return store;
};
