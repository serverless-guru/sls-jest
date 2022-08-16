import { z } from 'zod';

const EbSpiesContextParameterSchema = z.object({
  adapter: z.enum(['sqs', 'cw']).default('sqs'),
  busName: z.string(),
});

type EbSpiesContextParameter = z.infer<typeof EbSpiesContextParameterSchema>;

export const ContextParameter = {
  ebSpies: {
    parse: (param: string): EbSpiesContextParameter[] => {
      try {
        const parsedString = JSON.parse(param);
        return z.array(EbSpiesContextParameterSchema).parse(parsedString);
      } catch (e) {
        throw new Error(`Invalid context parameter string: ${param}`);
      }
    },
    toString: (param: EbSpiesContextParameter[]): string => {
      try {
        const validParam = z.array(EbSpiesContextParameterSchema).parse(param);
        return JSON.stringify(validParam);
      } catch (e) {
        throw new Error(`Invalid context parameter object: ${param}`);
      }
    },
  },
};
