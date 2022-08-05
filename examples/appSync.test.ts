import { vtlMappingTemplate } from 'sls-jest';

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
    await expect(
      vtlMappingTemplate({
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
    await expect(
      vtlMappingTemplate({
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
    await expect(
      vtlMappingTemplate({
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
    await expect(
      vtlMappingTemplate({
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
    await expect(
      vtlMappingTemplate({
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
    await expect(
      vtlMappingTemplate({
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
