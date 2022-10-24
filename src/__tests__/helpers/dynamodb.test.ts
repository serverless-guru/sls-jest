import { dynamodbItem, DynamodbItemInput } from '../../helpers';

describe('dynamodbItem', () => {
  it('should return a valid matcher input', () => {
    expect(
      dynamodbItem({
        tableName: 'my-table',
        key: {
          pk: 'USER#123',
          sk: 'USER#123',
        },
      }) as object,
    ).toMatchInlineSnapshot(`
      {
        "_slsJestHelperName": "dynamodbItem",
        "key": {
          "pk": "USER#123",
          "sk": "USER#123",
        },
        "tableName": "my-table",
      }
    `);
  });

  it('should throw an error on missing input', () => {
    expect(() => dynamodbItem({} as DynamodbItemInput))
      .toThrowErrorMatchingInlineSnapshot(`
      "Invalid dynamodbItem() input:
      	tableName: Required
      	key: Required"
    `);
  });

  it('should throw an error on invalid input', () => {
    expect(() =>
      dynamodbItem({
        tableName: 123,
        key: 123,
      } as unknown as DynamodbItemInput),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Invalid dynamodbItem() input:
      	tableName: Expected string, received number
      	key: Expected object, received number"
    `);
  });
});
