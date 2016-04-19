import test from 'tape';
import {createAction} from '../index';

test('Action', (it) => {
    it.test('# should create action that works', (t) => {
        const action = createAction();
        const testVal = 123;
        action.$.subscribe(val => {
            t.equal(val, testVal);
            t.end();
        });
        action(testVal);
    });
});
