import { getStackDetails } from '..';
import { ContextParameter } from '../context';

export const getEventBridgeSpyStack = (params: {
  busName: string;
  adapter?: 'sqs' | 'cw';
}) => {
  const { busName, adapter = 'sqs' } = params;

  if (!busName) {
    throw new Error('"busName" parameter is required');
  }

  const stackSuffix = `eb-spy-${params.busName}-${params.adapter}`;

  const stackDetails = getStackDetails({
    stackSuffix,
    app: 'sls-jest-eb-spy-stack',
    config: ContextParameter.eventBridgeSpyConfig.toString({
      busName,
      adapter,
    }),
  });

  const {
    stackName,
    LogGroupName: logGroupName,
    QueueUrl: queueUrl,
  } = stackDetails;

  return {
    stackName,
    logGroupName,
    queueUrl,
  };
};
