import { s3Object, S3ObjectInput } from '../../helpers';

describe('s3Object', () => {
  it('should return a valid matcher input', () => {
    expect(
      s3Object({
        bucketName: 'my-bucket',
        key: 'path/to/object.txt',
      }) as object,
    ).toMatchInlineSnapshot(`
      {
        "_slsJestHelperName": "s3Object",
        "bucketName": "my-bucket",
        "key": "path/to/object.txt",
      }
    `);
  });

  it('should throw an error on missing input', () => {
    expect(() => s3Object({} as S3ObjectInput))
      .toThrowErrorMatchingInlineSnapshot(`
      "Invalid s3Object() input:
      	bucketName: Required
      	key: Required"
    `);
  });

  it('should throw an error on invalid input', () => {
    expect(() =>
      s3Object({
        tableName: 123,
        key: 123,
      } as unknown as S3ObjectInput),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Invalid s3Object() input:
      	bucketName: Required
      	key: Expected string, received number"
    `);
  });
});
