import * as matchers from './assertions/index';

if (expect !== undefined) {
  expect.extend(matchers);
} else {
  console.error(
    "Unable to find Jest's global expect." +
      '\nPlease check you have added jest-extended correctly to your jest configuration.' +
      '\nSee https://github.com/jest-community/jest-extended#setup for help.',
  );
}