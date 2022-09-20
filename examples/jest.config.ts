import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./setupJest.ts'],
  testRegex: '(.*\\.test\\.(tsx?|jsx?))$',
};

export default config;
