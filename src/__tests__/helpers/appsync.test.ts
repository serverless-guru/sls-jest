import {
  appSyncMappingTemplate,
  AppSyncMappingTemplateInput,
  appSyncResolver,
  AppSyncResolverInput,
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

describe('appSyncResolver', () => {
  it('should return a valid matcher input', () => {
    expect(
      appSyncResolver({
        code: `export const request = (ctx) => {};`,
        function: 'request',
        context: {
          arguments: {
            foo: 'bar',
          },
        },
      }) as object,
    ).toMatchInlineSnapshot(`
      {
        "_slsJestHelperName": "appSyncResolver",
        "code": "export const request = (ctx) => {};",
        "context": {
          "arguments": {
            "foo": "bar",
          },
        },
        "function": "request",
      }
    `);
  });

  it('should throw an error on missing input', () => {
    expect(() => appSyncResolver({} as AppSyncResolverInput))
      .toThrowErrorMatchingInlineSnapshot(`
      "Invalid appSyncResolver() input:
      	code: Required
      	function: Required
      	context: Required"
    `);
  });

  it('should throw an error on invalid input', () => {
    expect(() =>
      appSyncResolver({
        code: 123,
        function: 'foo',
        context: 123,
      } as unknown as AppSyncResolverInput),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Invalid appSyncResolver() input:
      	code: Expected string, received number
      	function: Invalid enum value. Expected 'request' | 'response', received 'foo'
      	context: Expected object, received number"
    `);
  });
});
