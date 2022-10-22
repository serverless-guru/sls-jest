import {
  appSyncMappingTemplate,
  AppSyncMappingTemplateInput,
} from '../../helpers';

describe('appSyncMappingTemplate', () => {
  it('should return a valid matcher input', () => {
    expect(
      appSyncMappingTemplate({
        template: '#set($foo = "bar")',
        context: {
          arguments: {
            foo: 'bar',
          },
        },
      }) as object,
    ).toMatchInlineSnapshot(`
      {
        "_slsJestHelperName": "appSyncMappingTemplate",
        "context": {
          "arguments": {
            "foo": "bar",
          },
        },
        "template": "#set($foo = "bar")",
      }
    `);
  });

  it('should throw an error on missing input', () => {
    expect(() => appSyncMappingTemplate({} as AppSyncMappingTemplateInput))
      .toThrowErrorMatchingInlineSnapshot(`
      "Invalid appSyncMappingTemplate() input:
      	template: Required
      	context: Required"
    `);
  });

  it('should throw an error on invalid input', () => {
    expect(() =>
      appSyncMappingTemplate({
        template: 123,
        context: 123,
      } as unknown as AppSyncMappingTemplateInput),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Invalid appSyncMappingTemplate() input:
      	template: Expected string, received number
      	context: Expected object, received number"
    `);
  });
});
