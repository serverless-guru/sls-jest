module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./setupJest.ts'],
  testRegex: '(.*\\.test\\.(tsx?|jsx?))$',
};
