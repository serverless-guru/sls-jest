import { Chance } from 'chance';
import { cognitoSignIn, cognitoSignUp, cognitoUser } from 'sls-jest';

const chance = new Chance();

// TODO replace with your own values
const clientId = '3oed3rv2h43sleqojqtt2bb43a';
const userPoolId = 'us-east-1_2KFDP3x2n';

describe('Utils', () => {
  describe('cognitoSignUp', () => {
    it('should sign up a user and return its credentials, when user does not exist', async () => {
      const email = chance.email();
      const password = chance.string({ length: 8 });
      const credentials = await cognitoSignUp({
        clientId,
        userPoolId,
        username: email,
        password,
        attributes: [
          {
            Name: 'email',
            Value: email,
          },
        ],
      });

      expect(credentials).toMatchObject({
        AccessToken: expect.any(String),
        IdToken: expect.any(String),
      });
    });

    it('should throw an error when user already exists', async () => {
      const email = chance.email();
      const password = chance.string({ length: 8 });

      await cognitoSignUp({
        clientId,
        userPoolId,
        username: email,
        password,
        attributes: [
          {
            Name: 'email',
            Value: email,
          },
        ],
      });

      await expect(
        cognitoSignUp({
          clientId,
          userPoolId,
          username: email,
          password,
          attributes: [
            {
              Name: 'email',
              Value: email,
            },
          ],
        }),
      ).rejects.toMatchInlineSnapshot(
        `[UsernameExistsException: User account already exists]`,
      );
    });
  });

  describe('cognitoSignIn', () => {
    it('should sign in a user and return its credentials, when user exists', async () => {
      const email = chance.email();
      const password = chance.string({ length: 8 });

      await cognitoSignUp({
        clientId,
        userPoolId,
        username: email,
        password,
        attributes: [
          {
            Name: 'email',
            Value: email,
          },
        ],
      });

      const credentials = await cognitoSignIn({
        clientId,
        userPoolId,
        username: email,
        password,
      });

      expect(credentials).toMatchObject({
        AccessToken: expect.any(String),
        IdToken: expect.any(String),
      });
    });

    it('should throw an error when user does not exist', async () => {
      const email = chance.email();
      const password = chance.string({ length: 8 });

      await expect(
        cognitoSignIn({
          clientId,
          userPoolId,
          username: email,
          password,
        }),
      ).rejects.toMatchInlineSnapshot(
        `[NotAuthorizedException: Incorrect username or password.]`,
      );
    });
  });
});

describe('Matchers', () => {
  let existingUser: string;

  beforeAll(async () => {
    existingUser = chance.email();

    await cognitoSignUp({
      clientId,
      userPoolId,
      username: existingUser,
      password: chance.string({ length: 8 }),
      attributes: [
        {
          Name: 'email',
          Value: existingUser,
        },
      ],
    });
  });

  describe('toExist', () => {
    it('should succeed when user exists in the user pool', async () => {
      await expect(
        cognitoUser({
          username: existingUser,
          userPoolId,
        }),
      ).toExist();
    });

    it('should fails when user does not exist in the user pool', async () => {
      try {
        await expect(
          cognitoUser({
            username: 'kavimi@ahahov.ac',
            userPoolId,
          }),
        ).toExist();
      } catch (e) {
        expect(e).toMatchInlineSnapshot(
          `[Error: Expected "us-east-1_2KFDP3x2n" user pool to have a user with username "kavimi@ahahov.ac"]`,
        );
      }
    });

    it('should fails when user pool does not exist', async () => {
      try {
        await expect(
          cognitoUser({
            username: existingUser,
            userPoolId: 'us-east-1_fake_user_pool_id',
            retryPolicy: {
              retries: 3,
            },
          }),
        ).toExist();
      } catch (e) {
        expect(e).toMatchInlineSnapshot(
          `[ResourceNotFoundException: User pool us-east-1_fake_user_pool_id does not exist.]`,
        );
      }

      try {
        await expect(
          cognitoUser({
            username: existingUser,
            userPoolId,
            clientConfig: {
              region: 'us-east-2',
            },
          }),
        ).toExist();
      } catch (e) {
        expect(e).toMatchInlineSnapshot(
          `[ResourceNotFoundException: User pool us-east-1_2KFDP3x2n does not exist.]`,
        );
      }
    });
  });

  describe('.not.toExist', () => {
    it('should succeed when user does not exist in the user pool', async () => {
      await expect(
        cognitoUser({
          username: chance.email(),
          userPoolId,
        }),
      ).not.toExist();
    });

    it('should fail when user exists in the user pool', async () => {
      try {
        await expect(
          cognitoUser({
            username: 'petlejsaj@lirabzoz.fk',
            userPoolId,
            retryPolicy: {
              retries: 0,
            },
          }),
        ).not.toExist();
      } catch (e) {
        expect(e).toMatchInlineSnapshot(
          `[Error: Expected "us-east-1_2KFDP3x2n" user pool not to have a user with username "petlejsaj@lirabzoz.fk"]`,
        );
      }
    });
  });

  describe('toExistAndMatchObject', () => {
    it('should succeed when user exists and matches the expected object', async () => {
      await expect(
        cognitoUser({
          username: existingUser,
          userPoolId,
        }),
      ).toExistAndMatchObject({
        Username: existingUser,
        Enabled: true,
        UserAttributes: expect.arrayContaining([
          {
            Name: 'email',
            Value: existingUser,
          },
        ]),
      });
    });

    it("should fail when user exists but doesn't match the expected object", async () => {
      try {
        await expect(
          cognitoUser({
            username: existingUser,
            userPoolId,
          }),
        ).toExistAndMatchObject({
          Username: existingUser,
          Enabled: false,
          UserAttributes: expect.arrayContaining([
            {
              Name: 'email',
              Value: 'fake@fake.com',
            },
          ]),
        });
      } catch (e) {
        expect(e).toHaveProperty('message');
        expect(e).toHaveProperty('matcherResult.message');
        expect(e).toHaveProperty('matcherResult.actual');
        expect(e).toHaveProperty('matcherResult.expected', {
          Username: existingUser,
          Enabled: false,
          UserAttributes: expect.arrayContaining([
            {
              Name: 'email',
              Value: 'fake@fake.com',
            },
          ]),
        });
      }
    });

    it('should fail when user does not exists', async () => {
      try {
        const randomEmail = 'ci@nen.ma';
        await expect(
          cognitoUser({
            username: randomEmail,
            userPoolId,
          }),
        ).toExistAndMatchObject({
          Username: randomEmail,
          Enabled: true,
          UserAttributes: expect.arrayContaining([
            {
              Name: 'email',
              Value: existingUser,
            },
          ]),
        });
      } catch (e) {
        expect(e).toMatchInlineSnapshot(
          `[Error: Expected "us-east-1_2KFDP3x2n" user pool to have a user with username "ci@nen.ma"]`,
        );
      }

      try {
        await expect(
          cognitoUser({
            username: existingUser,
            userPoolId,
            clientConfig: {
              region: 'us-east-2',
            },
          }),
        ).toExistAndMatchObject({
          Username: existingUser,
          Enabled: true,
          UserAttributes: expect.arrayContaining([
            {
              Name: 'email',
              Value: existingUser,
            },
          ]),
        });
      } catch (e) {
        expect(e).toMatchInlineSnapshot(
          `[ResourceNotFoundException: User pool us-east-1_2KFDP3x2n does not exist.]`,
        );
      }
    });
  });

  describe('.not.toExistAndMatchObject', () => {
    it('should fail when user exists and matches the expected object', async () => {
      try {
        await expect(
          cognitoUser({
            username: existingUser,
            userPoolId,
            retryPolicy: {
              retries: 0,
            },
          }),
        ).not.toExistAndMatchObject({
          Username: existingUser,
          Enabled: true,
          UserAttributes: expect.arrayContaining([
            {
              Name: 'email',
              Value: existingUser,
            },
          ]),
        });
      } catch (e) {
        expect(e).toHaveProperty('message');
        expect(e).toHaveProperty('matcherResult.message');
        expect(e).toHaveProperty('matcherResult.actual');
        expect(e).toHaveProperty('matcherResult.expected', {
          Username: existingUser,
          Enabled: true,
          UserAttributes: expect.arrayContaining([
            {
              Name: 'email',
              Value: existingUser,
            },
          ]),
        });
      }
    });

    it("should succeed when user exists but doesn't match the expected object", async () => {
      await expect(
        cognitoUser({
          username: existingUser,
          userPoolId,
        }),
      ).not.toExistAndMatchObject({
        Username: existingUser,
        Enabled: false,
      });
    });

    it('should succeed when user does not exists', async () => {
      const randomEmail = chance.email();
      await expect(
        cognitoUser({
          username: randomEmail,
          userPoolId,
        }),
      ).not.toExistAndMatchObject({
        Username: randomEmail,
        Enabled: true,
      });
    });
  });

  describe('toExistAndMatchSnapshot', () => {
    // TODO
    it.skip('should print values when user exists', async () => {
      await expect(
        cognitoUser({
          username: existingUser,
          userPoolId,
        }),
      ).toExistAndMatchSnapshot();
    });

    it('should fail when user does not exists', async () => {
      try {
        await expect(
          cognitoUser({
            username: 'vuvitgoj@raij.km',
            userPoolId,
            retryPolicy: {
              retries: 0,
            },
          }),
        ).toExistAndMatchSnapshot();
      } catch (e) {
        expect(e).toMatchInlineSnapshot(
          `[Error: Expected "us-east-1_2KFDP3x2n" user pool to have a user with username "vuvitgoj@raij.km"]`,
        );
      }

      try {
        await expect(
          cognitoUser({
            username: chance.email(),
            userPoolId,
            clientConfig: {
              region: 'us-east-2',
            },
          }),
        ).toExistAndMatchSnapshot();
      } catch (e) {
        expect(e).toMatchInlineSnapshot(
          `[ResourceNotFoundException: User pool us-east-1_2KFDP3x2n does not exist.]`,
        );
      }
    });
  });

  describe('toExistAndMatchInlineSnapshot', () => {
    // TODO
    it.skip('should print values when user exists', async () => {
      await expect(
        cognitoUser({
          username: existingUser,
          userPoolId,
        }),
      ).toExistAndMatchInlineSnapshot();
    });

    // FIXME: I'm note sure why .toExistAndMatchInlineSnapshot is throwing an error that is not caught by the try catch block
    it.skip('should fail when user does not match snapshot', async () => {
      try {
        await expect(
          cognitoUser({
            username: existingUser,
            userPoolId,
            retryPolicy: {
              retries: 0,
            },
          }),
        ).toExistAndMatchInlineSnapshot(`
          Object {
            "id": "123",
            "title": "Buy a new car",
          }
        `);
      } catch (e) {
        expect(e).toMatchInlineSnapshot();
      }
    });

    it('should fail when user does not exists', async () => {
      try {
        await expect(
          cognitoUser({
            username: 'jurol@ceow.io',
            userPoolId,
            retryPolicy: {
              retries: 0,
            },
          }),
        ).toExistAndMatchInlineSnapshot();
      } catch (e) {
        expect(e).toMatchInlineSnapshot(
          `[Error: Expected "us-east-1_2KFDP3x2n" user pool to have a user with username "jurol@ceow.io"]`,
        );
      }

      try {
        await expect(
          cognitoUser({
            username: chance.email(),
            userPoolId,
            clientConfig: {
              region: 'us-east-2',
            },
          }),
        ).toExistAndMatchInlineSnapshot();
      } catch (e) {
        expect(e).toMatchInlineSnapshot(
          `[ResourceNotFoundException: User pool us-east-1_2KFDP3x2n does not exist.]`,
        );
      }
    });
  });
});
