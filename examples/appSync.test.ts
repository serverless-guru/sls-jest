import { vtlMappingTemplate } from 'sls-jest';

const template = `
#set($id=$ctx.args.id)
{
  "id": "$id"
}
`;

describe('Mapping Template', () => {
  it('should evaluate a template', async () => {
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

  it('should evaluate a template snapshot', async () => {
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

  it('should evaluate a template inline snapshot', async () => {
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
      "
      {
        \\"id\\": \\"789\\"
      }
      "
    `);
  });
});
