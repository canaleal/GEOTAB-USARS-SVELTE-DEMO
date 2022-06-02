import { getDataWithAxios } from '../src/util/fetch-data';

// Jest test for getDataWithAxios
test('getDataWithAxios', async () => {
  const response = await getDataWithAxios('https://jsonplaceholder.typicode.com/todos/1');
  expect(response.title).toBe('delectus aut autem');
});

// Jest test fail for getDataWithAxios
test.failing('getDataWithAxios', async () => {
  const response = await getDataWithAxios('https://jsonplaceholder.typicode.com/todos/1');
  expect(response.title).toBe('error');
});
