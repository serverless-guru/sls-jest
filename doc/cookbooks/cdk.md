# Use with the CDK

This sections shows how you can use `sls-jest` with the CDK.

## Extracting resource references

When writing tests, you need to access your resources. It can be the name of a DynamoDB table, an API Gateway endpoint url, the ARN of a Step Function state machine, etc.

When those values are predictable, it is usually not an issue, but this this is not always the case. e.g. ARNs are not alays predictable, or if you let CloudFormation name your resources with a random name.

The CDK has an `--outputs-file` parameter which prints the stack outputs in a file. You can use that to export the values that you needm and access them from `jest`.

Example:

If you want to access a DynamoDB table name, you can do:

```ts
// myStack.ts
const myTable = new Table(this, 'MyTable', {
  partitionKey: { name: 'pk', type: AttributeType.STRING },
  sortKey: { name: 'sk', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
});

new CfnOutput(this, 'MyTableName', {
  value: myTable.tableName,
});
```

Deploy:

```bash
npx cdk deploy --all --outputs-file .sls-jest/resources.json
```

Which genereates a file looking like this:

```json
// .sls-jest/resources.json
{
  "myStack": {
    "MyTableName": "myStack-MyTable72A94F83-WEE9G8164XWC"
  }
}
```

You can now access your resource from `jest`.

```ts
import { truncateTable } from 'sls-jest';
import resources from '.sls-jest/resources.json';

const myTable = resources.myStack.MyTableName;

beforeEach(async () => {
  await truncateTable(myTable);
});
```
