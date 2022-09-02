import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SLS_JEST_TAG } from '../constants';

export class SlsJestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const tag = scope.node.tryGetContext('tag') as string | undefined;
    if (!tag) {
      throw new Error("Must pass a '-c tag=<TAG>' context parameter");
    }

    Tags.of(this).add(SLS_JEST_TAG, tag);
  }
}
