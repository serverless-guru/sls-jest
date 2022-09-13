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
export const s3Object: RetryableMatcherHelper<'s3Object', S3ObjectInput> = (
  input,
) => {
  assertMatcherHelperInputValue('s3Object', s3ObjectInputSchema, input);

  return {
    _helperName: 's3Object',
    ...input,
  };
};
