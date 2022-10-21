import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePaths: ['node_modules', 'src'],
  testRegex: '(src/__tests__/.*\\.test\\.ts)$',
};

export default config;
