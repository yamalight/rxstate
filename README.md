# RxState

[![npm](https://img.shields.io/npm/v/rxstate.svg)](https://www.npmjs.com/package/rxstate)
[![MIT](https://img.shields.io/npm/l/rxstate.svg)](http://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/yamalight/rxstate.svg?branch=master)](https://travis-ci.org/yamalight/rxstate)
[![Coverage Status](https://coveralls.io/repos/github/yamalight/rxstate/badge.svg?branch=master)](https://coveralls.io/github/yamalight/rxstate?branch=master)

> Simple opinionated state management library based on RxJS

## Installation

```sh
npm install --save rxstate rxjs
```

## Quick start

Example code for creating a store with status and typeahead fetching action is shown below:

```js
import fetchival from 'fetchival';
import {from} from 'rxjs';
import {map, filter, debounceTime, distinctUntilChanged, tap, flatMap} from 'rxjs/operators';
import {createStore, createAction, createStatus} from 'rxstate';

// create status action
const status = createStatus();

// create action that fetches typeahead suggestions from server
const getTypeahead = createAction();
const typeahead$ = getTypeahead.$.pipe(
  map(e => e.target.value),
  filter(q => q.length > 3),
  debounceTime(300),
  distinctUntilChanged(),
  tap(() => status('loading')),
  flatMap(q => from(fetchival(typeaheadAPI).post({q}))),
  tap(() => status('done'))
);

// create an array of action streams for store
const streams = [status.$, typeahead$];
// create store
const store = createStore({streams, defaultState: {init: true}});

// other place in code:
// subscribe for state updates
store.subscribe(state => {
  console.log(state);
  // ... handle your state here
});

// other place in code:
// trigger action
getTypeahead('keyword');
```

## Things to keep in mind

- Rxstate has RxJS as peer dependency - don't forget to install it as well!
- Store will always return last value to new subscribers.
- By default, the state is updated using spread operator on new and old state (e.g. `{...oldState, ...newState}`). You can change that by passing `combinator` parameter during store creation, e.g.:

```js
// create combinator that always returns new state
const combinator = (_, data) => data;
// create store
const store = createStore({streams, defaultState, combinator});
```

- Status action and stream can be created using `createStatus` function. By default it'll write status as `{status: 'statusText'}`. Key can be changed by passing the string parameter to the function, e.g.:

```js
// create status with custom key
const status = createStatus('customStatus');
// state will be updated with {customStatus: 'statusText'}
```

- Stores have `.clear()` method that accepts new initial state as an optional argument and dispatches new action with either provided or default state as value. If you use default combinator logic - this will reset your state to initial one.

## License

[MIT](http://www.opensource.org/licenses/mit-license)
