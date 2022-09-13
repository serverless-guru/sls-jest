import { s3Object } from '@serverless-guru/sls-jest';

describe('toExist', () => {
  it('should succeed when object exists in the bucket', async () => {
    await expect(
      s3Object({
        bucketName: 'sls-jest-bucket',
        key: 'test.txt',
      }),
    ).toExist();
  });

  it('should fail when object does not exist in the bucket', async () => {
    try {
      await expect(
        s3Object({
          bucketName: 'sls-jest-bucket',
          key: 'test1.txt',
        }),
      ).toExist();
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[Error: Expected "sls-jest-bucket" bucket to have an object with key "test1.txt"]`,
      );
    }
  });
});

describe('.not.toExist', () => {
  it('should succeed when object does not exist in the bucket', async () => {
    await expect(
      s3Object({
        bucketName: 'sls-jest-bucket',
        key: 'test1.txt',
      }),
    ).not.toExist();
  });

  it('should fail when the object exists in the bucket', async () => {
    try {
      await expect(
        s3Object({
          bucketName: 'sls-jest-bucket',
          key: 'test.txt',
        }),
      ).not.toExist();
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[Error: Expected "sls-jest-bucket" bucket not to have an object with key "test.txt"]`,
      );
    }
  });
});

describe('toExistAndMatchObject', () => {
  it('should succeed when the object exists and matches the expected object', async () => {
    await expect(
      s3Object({
        bucketName: 'sls-jest-bucket',
        key: 'test.json',
      }),
    ).toExistAndMatchObject({
      message: 'Hello from sls-jest!',
    });
  });

  it("should fail when the object exists but doesn't match the expected object", async () => {
    try {
      await expect(
        s3Object({
          bucketName: 'sls-jest-bucket',
          key: 'test.json',
        }),
      ).toExistAndMatchObject({
        foo: 'bar',
      });
    } catch (e) {
      expect(e).toMatchInlineSnapshot(`
        [Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoExistAndMatchObject[2m([22m[32mexpected[39m[2m)[22m

        [32m- Expected  - 1[39m
        [31m+ Received  + 1[39m

        [2m  Object {[22m
        [32m-   "foo": "bar",[39m
        [31m+   "message": "Hello from sls-jest!",[39m
        [2m  }[22m]
      `);
    }
  });

  it('should fail when the object does not exist', async () => {
    try {
      await expect(
        s3Object({
          bucketName: 'sls-jest-bucket',
          key: 'test2.json',
        }),
      ).toExistAndMatchObject({
        message: 'Hello from sls-jest!',
      });
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[Error: Expected "sls-jest-bucket" bucket to have an object with key "test2.json"]`,
      );
    }
  });

  it("should fail when the object' content is not a valid JSON", async () => {
    try {
      await expect(
        s3Object({
          bucketName: 'sls-jest-bucket',
          key: 'test.txt',
        }),
      ).toExistAndMatchObject({
        message: 'Hello from sls-jest!',
      });
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[Error: "test.txt" from bucket "sls-jest-bucket" is not a valid JSON object.]`,
      );
    }
  });
});

describe('.not.toExistAndMatchObject', () => {
  it('should fail when the object exists and matches the expected object', async () => {
    try {
      await expect(
        s3Object({
          bucketName: 'sls-jest-bucket',
          key: 'test.json',
        }),
      ).not.toExistAndMatchObject({
        message: 'Hello from sls-jest!',
      });
    } catch (e) {
      expect(e).toMatchInlineSnapshot(`
        [Error: [2mexpect([22m[31mreceived[39m[2m).[22mnot[2m.[22mtoExistAndMatchObject[2m([22m[32mexpected[39m[2m)[22m

        Expected: not [32m{"message": "Hello from sls-jest!"}[39m
        Received:     [31m{"message": "Hello from sls-jest!"}[39m]
      `);
    }
  });

  it("should succeed when the object exists and doesn't match the expected object", async () => {
    await expect(
      s3Object({
        bucketName: 'sls-jest-bucket',
        key: 'test.json',
      }),
    ).not.toExistAndMatchObject({
      foo: 'bar',
    });
  });

  it('should succeed when the object does not exist', async () => {
    await expect(
      s3Object({
        bucketName: 'sls-jest-bucket',
        key: 'test2.json',
      }),
    ).not.toExistAndMatchObject({
      message: 'Hello from sls-jest!',
    });
  });
});

describe('toExistAndMatchSnapshot', () => {
  it('should print values when the object exists', async () => {
    await expect(
      s3Object({
        bucketName: 'sls-jest-bucket',
        key: 'test.txt',
      }),
    ).toExistAndMatchSnapshot();
  });

  it('should print values when the object exists, as a JSON', async () => {
    await expect(
      s3Object({
        bucketName: 'sls-jest-bucket',
        key: 'test.json',
      }),
    ).toExistAndMatchSnapshot();
  });

  it('should fail when the object does not exist', async () => {
    try {
      await expect(
        s3Object({
          bucketName: 'sls-jest-bucket',
          key: 'test2.txt',
        }),
      ).toExistAndMatchSnapshot();
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[Error: Expected "sls-jest-bucket" bucket to have an object with key "test2.txt"]`,
      );
    }
  });
});

describe('toExistAndMatchInlineSnapshot', () => {
  it('should print values when the object exists', async () => {
    await expect(
      s3Object({
        bucketName: 'sls-jest-bucket',
        key: 'test.txt',
      }),
    ).toExistAndMatchInlineSnapshot(`
      "Hello sls-jests!!
      "
    `);
  });

  it('should print values when the object exists, as a JSON', async () => {
    await expect(
      s3Object({
        bucketName: 'sls-jest-bucket',
        key: 'test.json',
      }),
    ).toExistAndMatchInlineSnapshot(`
      Object {
        "message": "Hello from sls-jest!",
      }
    `);
  });

  it('should fail when the object does not exist', async () => {
    try {
      await expect(
        s3Object({
          bucketName: 'sls-jest-bucket',
          key: 'test2.txt',
        }),
      ).toExistAndMatchInlineSnapshot();
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[Error: Expected "sls-jest-bucket" bucket to have an object with key "test2.txt"]`,
      );
    }
  });
});
