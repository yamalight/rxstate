/* eslint-env jest */
import {createAction} from '../index';

describe('Action', () => {
  test('# should create action that works', done => {
    const action = createAction();
    const testVal = 123;
    action.$.subscribe(val => {
      expect(val).toEqual(testVal);
      done();
    });
    action(testVal);
  });
});
