import { removeEverySecondElementFromArray } from '../src/util/data-cleaning';

test('Remove every second element from array', () => {
  expect((removeEverySecondElementFromArray([1, 1, 2, 2, 3, 3, 4, 4])).length).toBe(4);
});

test.failing('Remove every second element from array', () => {
  expect((removeEverySecondElementFromArray([1, 1, 2, 2, 3, 3, 4, 4])).length).toBe(3);
});
