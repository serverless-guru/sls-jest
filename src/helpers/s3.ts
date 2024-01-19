import { S3Client } from '@aws-sdk/client-s3';
import { z } from 'zod';
import {
  HelperZodSchema,
  RetryableMatcherHelper,
  assertMatcherHelperInputValue,
} from './internal';

/**
 * S3 Object helper input
 */
export type S3ObjectInput = {
  /**
   * The S3 bucket name.
   */
  bucketName: string;
  /**
   * The S3 object key.
   */
  key: string;
  /**
   * An optional S3 SDK client configuration.
   */
  clientConfig?: S3Client;
};

/**
 * S3 Object schema
 */
const s3ObjectInputSchema: HelperZodSchema<typeof s3Object> = z.object({
  bucketName: z.string(),
  key: z.string(),
});

/**
 * Helper function that represents an S3 Object.
 *
 * Use with {@link expect} and any compatible matcher.
 * @see https://serverlessguru.gitbook.io/sls-jest/matchers/s3
 *
 * @param input {@link S3ObjectInput}
 *
 * @example
 *
 * expect(s3Object({
 *   bucketName: 'my-bucket',
 *   key: 'invoice123.pdf'
 * })).toExist();
 */
export const s3Object: RetryableMatcherHelper<'s3Object', S3ObjectInput> = (
  input,
) => {
  assertMatcherHelperInputValue('s3Object', s3ObjectInputSchema, input);

  return {
    _slsJestHelperName: 's3Object',
    ...input,
  };
};
