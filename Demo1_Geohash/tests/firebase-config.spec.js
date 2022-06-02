import FirebaseConfig from '../src/firebase/firebase-config';

// Jest test make sure firebase config is not null
test('FirebaseConfig is not null', () => {
  expect(FirebaseConfig).not.toBeNull();
});

// Jest test check if firebase config is an object
test('FirebaseConfig is an object', () => {
  expect(typeof FirebaseConfig).toBe('object');
});

// Jest test check if firebase config database url is valid
test('FirebaseConfig database url is valid', () => {
  expect(FirebaseConfig.databaseURL).toBeDefined();
});
