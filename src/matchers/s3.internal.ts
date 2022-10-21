import { equals, iterableEquality, subsetEquality } from '@jest/expect-utils';
import { MatcherContext } from 'expect';
import {
  matcherHint,
  MatcherHintOptions,
  printDiffOrStringify,
  printExpected,
  printReceived,
  stringify,
} from 'jest-matcher-utils';
import { Context, toMatchInlineSnapshot, toMatchSnapshot } from 'jest-snapshot';
import { canonicalize } from 'json-canonicalize';
import { withRetry } from '../utils/retry';
import { S3ObjectInput } from '../helpers';
import { NoSuchKey, NotFound, S3, S3ClientConfig } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { maybeParseJson } from './utils';

const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';

const s3Clients: Record<string, S3> = {};

const getS3Client = (config: S3ClientConfig = {}) => {
  const key = canonicalize(config);
  if (!s3Clients[key]) {
    s3Clients[key] = new S3(config);
  }

  return s3Clients[key];
};

export const toExist = withRetry(async function (
  this: MatcherContext,
  params: S3ObjectInput,
) {
  const { bucketName, key, clientConfig } = params;

  const client = getS3Client(clientConfig);

  let pass = false;
  try {
    await client.headObject({
      Bucket: bucketName,
      Key: key,
    });
    pass = true;
  } catch (e) {
    if (!(e instanceof NotFound)) {
      throw e;
    }
    pass = false;
  }

  return {
    message: () =>
      pass
        ? `Expected "${bucketName}" bucket not to have an object with key ${stringify(
            key,
          )}`
        : `Expected "${bucketName}" bucket to have an object with key ${stringify(
            key,
          )}`,
    pass: pass,
  };
});

export const toExistAndMatchObject = withRetry(async function (
  this: MatcherContext,
  input: S3ObjectInput,
  expected: Record<string, unknown>,
) {
  const matcherName = 'toExistAndMatchObject';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
  };

  const { bucketName, key, clientConfig } = input;

  const client = getS3Client(clientConfig);

  try {
    const { Body: body } = await client.getObject({
      Bucket: bucketName,
      Key: key,
    });

    const received = JSON.parse(await streamToString(body as Readable));

    const pass = equals(received, expected, [iterableEquality, subsetEquality]);

    const message = pass
      ? () =>
          matcherHint(matcherName, undefined, undefined, options) +
          '\n\n' +
          `Expected: not ${printExpected(expected)}\n` +
          (expected !== received
            ? `Received:     ${printReceived(received)}`
            : '')
      : () =>
          matcherHint(matcherName, undefined, undefined, options) +
          '\n\n' +
          printDiffOrStringify(
            expected,
            received,
            EXPECTED_LABEL,
            RECEIVED_LABEL,
            this.expand !== false,
          );

    return { actual: received, expected, message, name: matcherName, pass };
  } catch (e) {
    if (e instanceof SyntaxError) {
      return {
        message: () =>
          `"${key}" from bucket "${bucketName}" is not a valid JSON object.`,
        pass: false,
      };
    } else if (e instanceof NoSuchKey) {
      return {
        message: () =>
          `Expected "${bucketName}" bucket to have an object with key "${key}"`,
        pass: false,
      };
    }

    throw e;
  }
});

export const toExistAndMatchSnapshot = withRetry(async function (
  this: Context,
  input: S3ObjectInput,
  ...rest: any
) {
  const { bucketName, key, clientConfig } = input;

  const client = getS3Client(clientConfig);

  try {
    const { Body: body } = await client.getObject({
      Bucket: bucketName,
      Key: key,
    });

    const received = maybeParseJson(await streamToString(body as Readable));

    return toMatchSnapshot.call(this, received, ...rest);
  } catch (e) {
    if (e instanceof NoSuchKey) {
      return {
        message: () =>
          `Expected "${bucketName}" bucket to have an object with key "${key}"`,
        pass: false,
      };
    }

    throw e;
  }
});

export const toExistAndMatchInlineSnapshot = withRetry(async function (
  this: Context,
  input: S3ObjectInput,
  ...rest: any
) {
  const { bucketName, key, clientConfig } = input;

  const client = getS3Client(clientConfig);

  try {
    const { Body: body } = await client.getObject({
      Bucket: bucketName,
      Key: key,
    });

    const received = maybeParseJson(await streamToString(body as Readable));

    return toMatchInlineSnapshot.call(this, received, ...rest);
  } catch (e) {
    if (e instanceof NoSuchKey) {
      return {
        message: () =>
          `Expected "${bucketName}" bucket to have an object with key "${key}"`,
        pass: false,
      };
    }

    throw e;
  }
});

const streamToString = async (stream: Readable): Promise<string> => {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
};
