import test from 'tape';
import {Observable} from 'rx';
import {createAction, createStore, createStatus} from '../index';

test('Store', (it) => {
    it.test('# should create simple store', (t) => {
        // create test action
        const testAction = createAction();
        const test$ = testAction.$.map(() => ({test: true}));
        // create store
        const store = createStore({streams: [test$], defaultState: {init: true}});
        // subscribe for initial state
        store.take(1).subscribe(state => t.ok(state.get('init')));
        // subscribe for updated state
        store.skip(1).subscribe(state => {
            t.ok(state.get('init'));
            t.ok(state.get('test'));
            t.end();
        });
        // trigger action
        testAction();
    });

    it.test('# should create store with custom combinator', (t) => {
        // create test action
        const testAction = createAction();
        const test$ = testAction.$.map(() => ({test: true}));
        // create combinator that always returns new state
        const combinator = (_, data) => data;
        // create store
        const store = createStore({streams: [test$], defaultState: {init: true}, combinator});
        // subscribe for initial state
        store.take(1).subscribe(state => t.ok(state.get('init')));
        // subscribe for updated state
        store.skip(1).subscribe(state => {
            t.notOk(state.get('init'));
            t.ok(state.get('test'));
            t.end();
        });
        // trigger action
        testAction();
    });

    it.test('# should clear store state', (t) => {
        // create test action
        const testAction = createAction();
        const test$ = testAction.$.map(() => ({test: true}));
        // create store
        const store = createStore({streams: [test$], defaultState: {init: true, test: false}});
        // subscribe for initial state
        store.take(1).subscribe(state => {
            t.ok(state.get('init'));
            t.notOk(state.get('test'));
        });
        // subscribe for updated state
        store.skip(1).take(1).subscribe(state => {
            t.ok(state.get('init'));
            t.ok(state.get('test'));
            // trigger clear
            store.clear();
        });
        // subscribe for clear update
        store.skip(2).subscribe(state => {
            t.ok(state.get('init'));
            t.notOk(state.get('test'));
            t.end();
        });
        // trigger action
        testAction();
    });

    it.test('# should update store status', (t) => {
        // create status
        const status = createStatus();
        // create test action
        const testAction = createAction();
        const test$ = testAction.$
            .do(() => status('loading'))
            .flatMap(() => Observable.timer(200).map(() => ({test: true})))
            .do(() => status('done'));
        // create store
        const store = createStore({streams: [test$, status.$], defaultState: {init: true}});
        // subscribe for initial state
        store.take(1).subscribe(state => t.ok(state.get('init')));
        // subscribe for 'loading' state
        store.skip(1).take(1).subscribe(state => {
            t.ok(state.get('init'));
            t.notOk(state.get('test'));
            t.equal(state.get('status'), 'loading');
        });
        // subscribe for result state
        store.skip(2).take(1).subscribe(state => {
            t.ok(state.get('init'));
            t.notOk(state.get('test'));
            t.equal(state.get('status'), 'done');
        });
        // subscribe for final state
        store.skip(3).take(1).subscribe(state => {
            t.ok(state.get('init'));
            t.ok(state.get('test'));
            t.equal(state.get('status'), 'done');
            t.end();
        });
        // trigger action
        testAction();
    });
});
