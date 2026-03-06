// Silence noisy warnings in test output
jest.mock('expo/src/winter/runtime.native', () => ({}), { virtual: true });
