import * as dynamodb from 'matchers/dynamodb.internal';
import * as s3 from 'matchers/s3.internal';
import { appSyncMappingTemplate, dynamodbItem, s3Object } from '../../helpers';
import {
  toExist,
  toExistAndMatchObject,
  toExistAndMatchInlineSnapshot,
  toExistAndMatchSnapshot,
} from 'matchers';

describe('toExist', () => {
  it('should accept dynamodbItem inputs', () => {
    const spy = jest.spyOn(dynamodb, 'toExist').mockResolvedValue({
      pass: true,
      message: () => 'message',
    });

    expect(
      toExist(
        dynamodbItem({
          tableName: 'table',
          key: { id: 'id' },
        }),
      ),
    ).resolves.toBeTruthy();
    expect(spy.mock.calls[0][0]).toMatchInlineSnapshot(`
      {
        "_helperName": "dynamodbItem",
        "key": {
          "id": "id",
        },
        "tableName": "table",
      }
    `);

    spy.mockRestore();
  });

  it('should accept s3 inputs', () => {
    const spy = jest.spyOn(s3, 'toExist').mockResolvedValue({
      pass: true,
      message: () => 'message',
    });

    expect(
      toExist(
        s3Object({
          bucketName: 'muy-bucket',
          key: 'path/to/file.txt',
        }),
      ),
    ).resolves.toBeTruthy();
    expect(spy.mock.calls[0][0]).toMatchInlineSnapshot(`
      {
        "_helperName": "s3Object",
        "bucketName": "muy-bucket",
        "key": "path/to/file.txt",
      }
    `);

    spy.mockRestore();
  });

  it('should not accept invalid inputs', () => {
    expect(
      toExist(
        appSyncMappingTemplate({
          template: 'template',
          context: {},
        }),
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"appSyncMappingTemplate() is not compatible with the toExist() matcher"`,
    );
  });

  it('should not accept unknown inputs', () => {
    expect(toExist({})).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Invalid matcher helper input. Please use one of the provided helpers."`,
    );
  });
});

describe('toExistAndMatchObject', () => {
  it('should accept dynamodbItem inputs', () => {
    const spy = jest
      .spyOn(dynamodb, 'toExistAndMatchObject')
      .mockResolvedValue({
        pass: true,
        message: () => 'message',
      });

    expect(
      toExistAndMatchObject(
        dynamodbItem({
          tableName: 'table',
          key: { id: 'id' },
        }),
      ),
    ).resolves.toBeTruthy();
    expect(spy.mock.calls[0][0]).toMatchInlineSnapshot(`
      {
        "_helperName": "dynamodbItem",
        "key": {
          "id": "id",
        },
        "tableName": "table",
      }
    `);

    spy.mockRestore();
  });

  it('should accept s3 inputs', () => {
    const spy = jest.spyOn(s3, 'toExistAndMatchObject').mockResolvedValue({
      pass: true,
      message: () => 'message',
    });

    expect(
      toExistAndMatchObject(
        s3Object({
          bucketName: 'muy-bucket',
          key: 'path/to/file.txt',
        }),
      ),
    ).resolves.toBeTruthy();
    expect(spy.mock.calls[0][0]).toMatchInlineSnapshot(`
      {
        "_helperName": "s3Object",
        "bucketName": "muy-bucket",
        "key": "path/to/file.txt",
      }
    `);

    spy.mockRestore();
  });

  it('should not accept invalid inputs', () => {
    expect(
      toExistAndMatchObject(
        appSyncMappingTemplate({
          template: 'template',
          context: {},
        }),
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"appSyncMappingTemplate() is not compatible with the toExistAndMatchObject() matcher"`,
    );
  });

  it('should not accept unknown inputs', () => {
    expect(
      toExistAndMatchObject({}),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Invalid matcher helper input. Please use one of the provided helpers."`,
    );
  });
});

describe('toExistAndMatchInlineSnapshot', () => {
  it('should accept dynamodbItem inputs', () => {
    const spy = jest
      .spyOn(dynamodb, 'toExistAndMatchInlineSnapshot')
      .mockResolvedValue({
        pass: true,
        message: () => 'message',
      });

    expect(
      toExistAndMatchInlineSnapshot(
        dynamodbItem({
          tableName: 'table',
          key: { id: 'id' },
        }),
      ),
    ).resolves.toBeTruthy();
    expect(spy.mock.calls[0][0]).toMatchInlineSnapshot(`
      {
        "_helperName": "dynamodbItem",
        "key": {
          "id": "id",
        },
        "tableName": "table",
      }
    `);

    spy.mockRestore();
  });

  it('should accept s3 inputs', () => {
    const spy = jest
      .spyOn(s3, 'toExistAndMatchInlineSnapshot')
      .mockResolvedValue({
        pass: true,
        message: () => 'message',
      });

    expect(
      toExistAndMatchInlineSnapshot(
        s3Object({
          bucketName: 'muy-bucket',
          key: 'path/to/file.txt',
        }),
      ),
    ).resolves.toBeTruthy();
    expect(spy.mock.calls[0][0]).toMatchInlineSnapshot(`
      {
        "_helperName": "s3Object",
        "bucketName": "muy-bucket",
        "key": "path/to/file.txt",
      }
    `);

    spy.mockRestore();
  });

  it('should not accept invalid inputs', () => {
    expect(
      toExistAndMatchInlineSnapshot(
        appSyncMappingTemplate({
          template: 'template',
          context: {},
        }),
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"appSyncMappingTemplate() is not compatible with the toExistAndMatchInlineSnapshot() matcher"`,
    );
  });

  it('should not accept unknown inputs', () => {
    expect(
      toExistAndMatchInlineSnapshot({}),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Invalid matcher helper input. Please use one of the provided helpers."`,
    );
  });
});

describe('toExistAndMatchSnapshot', () => {
  it('should accept dynamodbItem inputs', () => {
    const spy = jest
      .spyOn(dynamodb, 'toExistAndMatchSnapshot')
      .mockResolvedValue({
        pass: true,
        message: () => 'message',
      });

    expect(
      toExistAndMatchSnapshot(
        dynamodbItem({
          tableName: 'table',
          key: { id: 'id' },
        }),
      ),
    ).resolves.toBeTruthy();
    expect(spy.mock.calls[0][0]).toMatchInlineSnapshot(`
      {
        "_helperName": "dynamodbItem",
        "key": {
          "id": "id",
        },
        "tableName": "table",
      }
    `);

    spy.mockRestore();
  });

  it('should accept s3 inputs', () => {
    const spy = jest.spyOn(s3, 'toExistAndMatchSnapshot').mockResolvedValue({
      pass: true,
      message: () => 'message',
    });

    expect(
      toExistAndMatchSnapshot(
        s3Object({
          bucketName: 'muy-bucket',
          key: 'path/to/file.txt',
        }),
      ),
    ).resolves.toBeTruthy();
    expect(spy.mock.calls[0][0]).toMatchInlineSnapshot(`
      {
        "_helperName": "s3Object",
        "bucketName": "muy-bucket",
        "key": "path/to/file.txt",
      }
    `);

    spy.mockRestore();
  });

  it('should not accept invalid inputs', () => {
    expect(
      toExistAndMatchSnapshot(
        appSyncMappingTemplate({
          template: 'template',
          context: {},
        }),
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"appSyncMappingTemplate() is not compatible with the toExistAndMatchSnapshot() matcher"`,
    );
  });

  it('should not accept unknown inputs', () => {
    expect(
      toExistAndMatchSnapshot({}),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Invalid matcher helper input. Please use one of the provided helpers."`,
    );
  });
});
