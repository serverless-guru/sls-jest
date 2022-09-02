import { z } from 'zod';

const ebSpiesContextParameterSchema = z.object({
  adapter: z.enum(['sqs', 'cw']).default('sqs'),
  busName: z.string(),
});

type EbSpiesContextParameter = z.infer<typeof ebSpiesContextParameterSchema>;

export const ContextParametersManager = {
  eventBridgeSpyConfig: {
    parse: (param?: string): EbSpiesContextParameter => {
      if (!param) {
        throw new Error('"config" context parameter is required');
      }
      try {
        const parsedString = JSON.parse(param);
        return ebSpiesContextParameterSchema.parse(parsedString);
      } catch (e) {
        throw new Error(`Invalid context parameter string: ${param}`);
      }
    },
    toString: (param: EbSpiesContextParameter): string => {
      try {
        const validParam = ebSpiesContextParameterSchema.parse(param);
        return JSON.stringify(validParam);
      } catch (e) {
        throw new Error(`Invalid context parameter object: ${param}`);
      }
    },
  },
};
