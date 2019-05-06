/* eslint-env jest */
import {timer} from 'rxjs';
import {map, take, skip, tap, flatMap} from 'rxjs/operators';
import {createAction, createStore, createStatus} from '../index';

describe('Store', () => {
  test('# should create simple store', done => {
    // create test action
    const testAction = createAction();
    const test$ = testAction.$.pipe(map(() => ({test: true})));
    // create store
    const store = createStore({streams: [test$], defaultState: {init: true}});
    // subscribe for initial state
    store.pipe(take(1)).subscribe(state => expect(state.init).toBeTruthy());
    // subscribe for updated state
    store.pipe(skip(1)).subscribe(state => {
      expect(state.init).toBeTruthy();
      expect(state.test).toBeTruthy();
      done();
    });
    // trigger action
    testAction();
  });

  test('# should create store with custom combinator', done => {
    // create test action
    const testAction = createAction();
    const test$ = testAction.$.pipe(map(() => ({test: true})));
    // create combinator that always returns new state
    const combinator = (_, data) => data;
    // create store
    const store = createStore({streams: [test$], defaultState: {init: true}, combinator});
    // subscribe for initial state
    store.pipe(take(1)).subscribe(state => expect(state.init).toBeTruthy());
    // subscribe for updated state
    store.pipe(skip(1)).subscribe(state => {
      expect(state.init).toBeFalsy();
      expect(state.test).toBeTruthy();
      done();
    });
    // trigger action
    testAction();
  });

  test('# should clear store state', done => {
    // create test action
    const testAction = createAction();
    const test$ = testAction.$.pipe(map(() => ({test: true})));
    // create store
    const store = createStore({streams: [test$], defaultState: {init: true, test: false}});
    // subscribe for initial state
    store.pipe(take(1)).subscribe(state => {
      expect(state.init).toBeTruthy();
      expect(state.test).toBeFalsy();
    });
    // subscribe for updated state
    store
      .pipe(
        skip(1),
        take(1)
      )
      .subscribe(state => {
        expect(state.init).toBeTruthy();
        expect(state.test).toBeTruthy();
        // trigger clear
        setImmediate(() => store.clear());
      });
    // subscribe for clear update
    store.pipe(skip(2)).subscribe(state => {
      expect(state.init).toBeTruthy();
      expect(state.test).toBeFalsy();
      done();
    });
    // trigger action
    testAction();
  });

  test('# should update store status', done => {
    // create status
    const status = createStatus();
    // create test action
    const testAction = createAction();
    const test$ = testAction.$.pipe(
      tap(() => status('loading')),
      flatMap(() => timer(200).pipe(map(() => ({test: true})))),
      tap(() => status('done'))
    );
    // create store
    const store = createStore({streams: [test$, status.$], defaultState: {init: true}});
    // subscribe for initial state
    store.pipe(take(1)).subscribe(state => expect(state.init).toBeTruthy());
    // subscribe for 'loading' state
    store
      .pipe(
        skip(1),
        take(1)
      )
      .subscribe(state => {
        expect(state.init).toBeTruthy();
        expect(state.test).toBeFalsy();
        expect(state.status).toEqual('loading');
      });
    // subscribe for result state
    store
      .pipe(
        skip(2),
        take(1)
      )
      .subscribe(state => {
        expect(state.init).toBeTruthy();
        expect(state.test).toBeFalsy();
        expect(state.status).toEqual('done');
      });
    // subscribe for final state
    store
      .pipe(
        skip(3),
        take(1)
      )
      .subscribe(state => {
        expect(state.init).toBeTruthy();
        expect(state.test).toBeTruthy();
        expect(state.status).toEqual('done');
        done();
      });
    // trigger action
    testAction();
  });

  test('# should update store status with custom name', done => {
    // create status
    const status = createStatus('customStatus');
    // create test action
    const testAction = createAction();
    const test$ = testAction.$.pipe(
      tap(() => status('loading')),
      flatMap(() => timer(200).pipe(map(() => ({test: true})))),
      tap(() => status('done'))
    );
    // create store
    const store = createStore({streams: [test$, status.$], defaultState: {init: true}});
    // subscribe for initial state
    store.pipe(take(1)).subscribe(state => expect(state.init).toBeTruthy());
    // subscribe for 'loading' state
    store
      .pipe(
        skip(1),
        take(1)
      )
      .subscribe(state => {
        expect(state.init).toBeTruthy();
        expect(state.test).toBeFalsy();
        expect(state.customStatus).toEqual('loading');
      });
    // subscribe for result state
    store
      .pipe(
        skip(2),
        take(1)
      )
      .subscribe(state => {
        expect(state.init).toBeTruthy();
        expect(state.test).toBeFalsy();
        expect(state.customStatus).toEqual('done');
      });
    // subscribe for final state
    store
      .pipe(
        skip(3),
        take(1)
      )
      .subscribe(state => {
        expect(state.init).toBeTruthy();
        expect(state.test).toBeTruthy();
        expect(state.customStatus).toEqual('done');
        done();
      });
    // trigger action
    testAction();
  });

  test('# should allow triggering action multiple times', done => {
    // create test action
    const testAction = createAction();
    const test$ = testAction.$.pipe(map(() => ({test: true})));
    // create store
    const store = createStore({streams: [test$], defaultState: {init: true}});
    // subscribe for initial state
    store.pipe(take(1)).subscribe(state => expect(state.init).toBeTruthy());
    // subscribe for updated state
    store.pipe(skip(1)).subscribe(state => {
      expect(state.init).toBeTruthy();
      expect(state.test).toBeTruthy();
    });
    store.pipe(skip(3)).subscribe(state => {
      expect(state.init).toBeTruthy();
      expect(state.test).toBeTruthy();
      done();
    });
    // trigger action
    testAction();
    testAction();
    testAction();
  });

  test('# should return only last state to new subscriber', done => {
    // create test action
    const testAction = createAction();
    const test$ = testAction.$.pipe(map(() => ({test: true})));
    // create other test action
    const otherAction = createAction();
    const other$ = otherAction.$.pipe(map(() => ({other: true})));
    // create store
    const store = createStore({streams: [test$, other$], defaultState: {init: true}});
    // subscribe for initial state
    store.pipe(take(1)).subscribe(state => expect(state.init).toBeTruthy());
    // subscribe for updated state
    store.pipe(skip(1)).subscribe(state => {
      expect(state.init).toBeTruthy();
      expect(state.test).toBeTruthy();
    });
    // subscribe for updated state
    store.pipe(skip(2)).subscribe(state => {
      expect(state.init).toBeTruthy();
      expect(state.test).toBeTruthy();
      expect(state.other).toBeTruthy();
    });
    // trigger actions
    testAction();
    otherAction();
    // subscribe once more
    store.subscribe(state => {
      expect(state.init).toBeTruthy();
      expect(state.test).toBeTruthy();
      expect(state.other).toBeTruthy();
      done();
    });
  });

  test('# should clear store with custom clear state', done => {
    // create test action
    const testAction = createAction();
    const test$ = testAction.$.pipe(map(() => ({test: true})));
    // create store
    const store = createStore({streams: [test$], defaultState: {init: true, test: false}});
    // subscribe for initial state
    store.pipe(take(1)).subscribe(state => {
      expect(state.init).toBeTruthy();
      expect(state.test).toBeFalsy();
    });
    // subscribe for updated state
    store
      .pipe(
        skip(1),
        take(1)
      )
      .subscribe(state => {
        expect(state.init).toBeTruthy();
        expect(state.test).toBeTruthy();
        // trigger clear
        setImmediate(() => store.clear({init: false, test: true}));
      });
    // subscribe for clear update
    store.pipe(skip(2)).subscribe(state => {
      expect(state.init).toBeFalsy();
      expect(state.test).toBeTruthy();
      done();
    });
    // trigger action
    testAction();
  });
});
