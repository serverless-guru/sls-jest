module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./node_modules/sls-jest/lib/setup.js'],
  testRegex: '(.*\\.test\\.(tsx?|jsx?))$',
  moduleDirectories: ['node_modules', 'src'],
};
