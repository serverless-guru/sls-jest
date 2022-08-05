import { dynamodbItem } from 'sls-jest';

describe('toExist', () => {
  it('should succeed when item exists in the database', async () => {
    await expect(
      dynamodbItem({
        tableName: 'todos',
        key: {
          id: '123',
        },
      }),
    ).toExist();
  });

  it('should fails when item does not exist in the database', async () => {
    try {
      await expect(
        dynamodbItem({
          tableName: 'todos',
          key: {
            id: '456',
          },
        }),
      ).toExist();
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[Error: Expected "todos" table to have item with key {"id": "456"}]`,
      );
    }
  });

  it('should fails when database does not exist', async () => {
    try {
      await expect(
        dynamodbItem({
          tableName: 'toDos',
          key: {
            id: '456',
          },
        }),
      ).toExist();
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[ResourceNotFoundException: Requested resource not found]`,
      );
    }

    try {
      await expect(
        dynamodbItem({
          tableName: 'toDos',
          key: {
            id: '456',
          },
          clientConfig: {
            region: 'us-east-2',
          },
        }),
      ).toExist();
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[ResourceNotFoundException: Requested resource not found]`,
      );
    }
  });
});

describe('.not.toExist', () => {
  it('should succeed when item does not exist in the database', async () => {
    await expect(
      dynamodbItem({
        tableName: 'todos',
        key: {
          id: '456',
        },
      }),
    ).not.toExist();
  });

  it('should fail when item exists in the database', async () => {
    try {
      await expect(
        dynamodbItem({
          tableName: 'todos',
          key: {
            id: '123',
          },
        }),
      ).not.toExist();
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[Error: Expected "todos" table to not have item with key {"id": "123"}]`,
      );
    }
  });
});

describe('toExistAndMatchingObject', () => {
  it('should succeed when item exists and matches the expected object', async () => {
    await expect(
      dynamodbItem({
        tableName: 'todos',
        key: {
          id: '123',
        },
      }),
    ).toExistAndMatchingObject({
      id: '123',
      title: 'Buy milk',
    });
  });

  it("should fail when item exists but doesn't match the expected object", async () => {
    try {
      await expect(
        dynamodbItem({
          tableName: 'todos',
          key: {
            id: '123',
          },
        }),
      ).toExistAndMatchingObject({
        id: '123',
        title: 'Play Fifa',
      });
    } catch (e) {
      expect(e).toMatchInlineSnapshot(`
        [Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoExistAndMatchingObject[2m([22m[32mexpected[39m[2m)[22m

        [32m- Expected  - 1[39m
        [31m+ Received  + 1[39m

        [2m  Object {[22m
        [2m    "id": "123",[22m
        [32m-   "title": "Play Fifa",[39m
        [31m+   "title": "Buy milk",[39m
        [2m  }[22m]
      `);
    }
  });

  it('should fail when item does not exists', async () => {
    try {
      await expect(
        dynamodbItem({
          tableName: 'todos',
          key: {
            id: '456',
          },
        }),
      ).toExistAndMatchingObject({
        id: '456',
        title: 'Play Fifa',
      });
    } catch (e) {
      expect(e).toMatchInlineSnapshot(`
        [Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoExistAndMatchingObject[2m([22m[32mexpected[39m[2m)[22m

        Expected: [32m{"id": "456", "title": "Play Fifa"}[39m
        Received: [31mundefined[39m]
      `);
    }

    try {
      await expect(
        dynamodbItem({
          tableName: 'todos',
          key: {
            id: '456',
          },
          clientConfig: {
            region: 'us-east-2',
          },
        }),
      ).toExistAndMatchingObject({
        id: '456',
        title: 'Play Fifa',
      });
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[ResourceNotFoundException: Requested resource not found]`,
      );
    }
  });
});

describe('.not.toExistAndMatchingObject', () => {
  it('should fail when item exists and matches the expected object', async () => {
    try {
      await expect(
        dynamodbItem({
          tableName: 'todos',
          key: {
            id: '123',
          },
        }),
      ).not.toExistAndMatchingObject({
        id: '123',
        title: 'Buy milk',
      });
    } catch (e) {
      expect(e).toMatchInlineSnapshot(`
        [Error: [2mexpect([22m[31mreceived[39m[2m).[22mnot[2m.[22mtoExistAndMatchingObject[2m([22m[32mexpected[39m[2m)[22m

        Expected: not [32m{"id": "123", "title": "Buy milk"}[39m
        Received:     [31m{"id": "123", "title": "Buy milk"}[39m]
      `);
    }
  });

  it("should succeed when item exists but doesn't match the expected object", async () => {
    await expect(
      dynamodbItem({
        tableName: 'todos',
        key: {
          id: '123',
        },
      }),
    ).not.toExistAndMatchingObject({
      id: '123',
      title: 'Play Fifa',
    });
  });

  it('should succeed when item does not exists', async () => {
    await expect(
      dynamodbItem({
        tableName: 'todos',
        key: {
          id: '456',
        },
      }),
    ).not.toExistAndMatchingObject({
      id: '456',
      title: 'Play Fifa',
    });
  });
});

describe('toExistAndMatchingSnapshot', () => {
  it('should print values when item exists', async () => {
    await expect(
      dynamodbItem({
        tableName: 'todos',
        key: {
          id: '123',
        },
      }),
    ).toExistAndMatchingSnapshot();
  });

  it('should fail when item does not exists', async () => {
    try {
      await expect(
        dynamodbItem({
          tableName: 'todos',
          key: {
            id: '456',
          },
        }),
      ).toExistAndMatchingSnapshot();
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[Error: Expected "todos" table to have item with key {"id": "456"}]`,
      );
    }

    try {
      await expect(
        dynamodbItem({
          tableName: 'todos',
          key: {
            id: '456',
          },
          clientConfig: {
            region: 'us-east-2',
          },
        }),
      ).toExistAndMatchingSnapshot();
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[ResourceNotFoundException: Requested resource not found]`,
      );
    }
  });
});

describe('toExistAndMatchingInlineSnapshot', () => {
  it('should print values when item exists', async () => {
    await expect(
      dynamodbItem({
        tableName: 'todos',
        key: {
          id: '123',
        },
      }),
    ).toExistAndMatchingInlineSnapshot(`
      Object {
        "id": "123",
        "title": "Buy milk",
      }
    `);
  });

  // TODO
  it.skip('should fail when item does not match snapshot', async () => {
    try {
      await expect(
        dynamodbItem({
          tableName: 'todos',
          key: {
            id: '123',
          },
        }),
      ).toExistAndMatchingInlineSnapshot(`
        Object {
          "id": "123",
          "title": "Buy a new car",
        }
      `);
    } catch (e) {
      expect(e).toMatchInlineSnapshot();
    }
  });

  it('should fail when item does not exists', async () => {
    try {
      await expect(
        dynamodbItem({
          tableName: 'todos',
          key: {
            id: '456',
          },
        }),
      ).toExistAndMatchingInlineSnapshot();
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[Error: Expected "todos" table to have item with key {"id": "456"}]`,
      );
    }

    try {
      await expect(
        dynamodbItem({
          tableName: 'todos',
          key: {
            id: '456',
          },
          clientConfig: {
            region: 'us-east-2',
          },
        }),
      ).toExistAndMatchingInlineSnapshot();
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[ResourceNotFoundException: Requested resource not found]`,
      );
    }
  });
});
