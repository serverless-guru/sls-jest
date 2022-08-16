// Temporary fix for "Cannot find name 'ReadableStream'." when running `npm run build`.
// https://github.com/aws/aws-sdk-js-v3/issues/3063#issuecomment-1188564123

export {};

declare global {
  interface ReadableStream {}
}
