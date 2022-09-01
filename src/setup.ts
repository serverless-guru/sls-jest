import * as matchers from './matchers';

export function setupSlsJest(): void {
  if (expect !== undefined) {
    expect.extend(matchers);
  } else {
    console.error(
      "Unable to find Jest's global expect." +
        '\nPlease check you have added jest-extended correctly to your jest configuration.' +
        '\nSee https://github.com/jest-community/jest-extended#setup for help.',
    );
  }
}
