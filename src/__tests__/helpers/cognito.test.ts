import { cognitoUser, CognitoUserInput } from '../../helpers';

describe('cognitoUser', () => {
  it('should return a valid matcher input', () => {
    expect(
      cognitoUser({
        username: '123',
        userPoolId: 'my-pool',
      }) as object,
    ).toMatchInlineSnapshot(`
      {
        "_slsJestHelperName": "cognitoUser",
        "userPoolId": "my-pool",
        "username": "123",
      }
    `);
  });

  it('should throw an error on missing input', () => {
    expect(() => cognitoUser({} as CognitoUserInput))
      .toThrowErrorMatchingInlineSnapshot(`
      "Invalid cognitoUser() input:
      	userPoolId: Required
      	username: Required"
    `);
  });

  it('should throw an error on invalid input', () => {
    expect(() =>
      cognitoUser({
        tableName: 123,
        key: 123,
        username: 123,
        UserPoolId: true,
      } as unknown as CognitoUserInput),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Invalid cognitoUser() input:
      	userPoolId: Required
      	username: Expected string, received number"
    `);
  });
});
