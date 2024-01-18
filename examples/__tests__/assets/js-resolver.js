import { get } from '@aws-appsync/utils/dynamodb';

export const request = (ctx) => {
  return get({
    key: {
      id: ctx.args.id,
    },
  });
};

export const response = (ctx) => {
  return ctx.result;
};
