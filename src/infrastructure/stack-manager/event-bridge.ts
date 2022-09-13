import { getStackDetails } from '..';
import { ContextParametersManager } from '../context-parameters-manager';

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
    stackType: 'eventBridgeSpy',
    config: ContextParametersManager.eventBridgeSpyConfig.toString({
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
