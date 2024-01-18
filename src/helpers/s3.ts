import { S3Client } from '@aws-sdk/client-s3';
import { z } from 'zod';
import {
  HelperZodSchema,
  RetriableMatcherHelper,
  assertMatcherHelperInputValue,
} from './internal';

/**
 * S3 Object helper input
 *
 * @param {string} bucketName The S3 bucket name.
 * @param {string} key The S3 object key.
 * @param {object} clientConfig An optional S3 SDK client configuration.
 */
export type S3ObjectInput = {
  bucketName: string;
  key: string;
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
 * S3 Object helper
 */
export const s3Object: RetriableMatcherHelper<'s3Object', S3ObjectInput> = (
  input,
) => {
  assertMatcherHelperInputValue('s3Object', s3ObjectInputSchema, input);

  return {
    _slsJestHelperName: 's3Object',
    ...input,
  };
};
