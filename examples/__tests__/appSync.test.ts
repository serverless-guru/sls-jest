import { DynamoDBGetItemRequest } from '@aws-appsync/utils';
import { appSyncMappingTemplate, appSyncResolver } from 'sls-jest';

type DynamoDBGetItem = {
  version: string;
  operation: string;
  key: {
    pk: { S: string };
  };
};

const template = __dirname + '/assets/mapping-template.vtl';

describe('Mapping Template', () => {
  it('should evaluate a template', async () => {
    await expect(
      appSyncMappingTemplate({
        template,
        context: {
          arguments: {
            id: '123',
          },
        },
      }),
    ).toEvaluateTo<DynamoDBGetItem>({
      version: '2017-02-28',
      operation: 'GetItem',
      key: {
        pk: { S: '123' },
      },
    });
  });

  it('should evaluate a template snapshot', async () => {
    await expect(
      appSyncMappingTemplate({
        template,
        context: {
          arguments: {
            id: '456',
          },
        },
      }),
    ).toEvaluateToSnapshot();
  });

  it('should evaluate a template inline snapshot', async () => {
    await expect(
      appSyncMappingTemplate({
        template,
        context: {
          arguments: {
            id: '789',
          },
        },
      }),
    ).toEvaluateToInlineSnapshot(`
      Object {
        "key": Object {
          "pk": Object {
            "S": "789",
          },
        },
        "operation": "GetItem",
        "version": "2017-02-28",
      }
    `);
  });
});

describe('JS resolvers', () => {
  const code = __dirname + '/assets/js-resolver.js';

  it('should evaluate a js resolver', async () => {
    await expect(
      appSyncResolver({
        code,
        function: 'request',
        context: {
          arguments: {
            id: '123',
          },
        },
      }),
    ).toEvaluateTo<DynamoDBGetItemRequest>({
      operation: 'GetItem',
      key: {
        id: { S: '123' },
      },
    });

    await expect(
      appSyncResolver({
        code,
        function: 'response',
        context: {
          arguments: {
            id: '123',
          },
          result: {
            id: '123',
            name: 'test',
          },
        },
      }),
    ).toEvaluateTo({
      id: '123',
      name: 'test',
    });
  });

  it('should evaluate a js resolver with snapshot', async () => {
    await expect(
      appSyncResolver({
        code,
        function: 'request',
        context: {
          arguments: {
            id: '123',
          },
        },
      }),
    ).toEvaluateToSnapshot();
  });

  it('should evaluate a js resolver inline snapshot', async () => {
    await expect(
      appSyncResolver({
        code,
        function: 'request',
        context: {
          arguments: {
            id: '789',
          },
        },
      }),
    ).toEvaluateToInlineSnapshot(`
      Object {
        "key": Object {
          "id": Object {
            "S": "789",
          },
        },
        "operation": "GetItem",
      }
    `);
  });
});
