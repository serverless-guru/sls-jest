import { appSyncMappingTemplate } from '@serverless-guru/sls-jest';

const template = `
#set($id=$ctx.args.id)
{
  "id": "$id"
}
`;

describe('Mapping Template', () => {
  it('should evaluate a template string', async () => {
    const expected = `
{
  "id": "123"
}
`;

    // test that the template evaluates to the expected value as a string
    await expect(
      appSyncMappingTemplate({
        template,
        context: {
          arguments: {
            id: '123',
          },
        },
      }),
    ).toEvaluateTo(expected);
  });

  it('should evaluate a template object', async () => {
    // test that the template evaluates to the expected value as an object
    await expect(
      appSyncMappingTemplate({
        template,
        context: {
          arguments: {
            id: '123',
          },
        },
      }),
    ).toEvaluateTo({ id: '123' });
  });

  it('should evaluate a template snapshot as object', async () => {
    // test that the template evaluates to the expected snapshot
    // if the snapshot evaluates to an object, it is parsed before being saved
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

  it('should evaluate a template inline snapshot as object', async () => {
    // test that the template evaluates to the expected inline snapshot
    // if the snapshot evaluates to an object, it is parsed before being saved
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
        "id": "789",
      }
    `);
  });

  it('should evaluate a template snapshot as string', async () => {
    // test that the template evaluates to the expected snapshot
    await expect(
      appSyncMappingTemplate({
        template: 'hello ${ctx.args.id}',
        context: {
          arguments: {
            id: '456',
          },
        },
      }),
    ).toEvaluateToSnapshot();
  });

  it('should evaluate a template inline snapshot', async () => {
    // test that the template evaluates to the expected inline snapshot
    await expect(
      appSyncMappingTemplate({
        template: 'hello ${ctx.args.id}',
        context: {
          arguments: {
            id: '789',
          },
        },
      }),
    ).toEvaluateToInlineSnapshot(`"hello 789"`);
  });
});
