import { EventBridgeEvent } from 'aws-lambda';
import { ItemType } from './helpers/internal';
import { O } from 'ts-toolbelt';
import { EventBridgeSpy } from './spies';
export * from './helpers';
export * as matchers from './matchers';
export * from './spies';
export * from './utils/dynamodb';
export * from './utils/cognito';

// Note: we cannot use the internal IMatcherHelperInput type here
// because it does not work for some reason.
type MatcherHelper<Name extends ItemType> = {
  _slsJestHelperName: Name;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface EvaluateMatchers {
      toEvaluateTo<E extends object | string>(template: E): Promise<void>;
      toEvaluateToSnapshot(
        propertiesOrHint?: string,
        hint?: string,
      ): Promise<void>;
      toEvaluateToInlineSnapshot(
        propertiesOrHint?: string,
        hint?: string,
      ): Promise<void>;
    }

    interface ExistenceMatchers {
      toExist(): Promise<void>;
      toExistAndMatchObject<E extends object>(
        params: O.Partial<E, 'deep'>,
      ): Promise<void>;
      toExistAndMatchSnapshot<E extends object | string>(
        propertyMatchers?: E extends object ? O.Partial<E, 'deep'> : string,
        hint?: string,
      ): Promise<void>;
      toExistAndMatchInlineSnapshot<E extends object | string>(
        propertyMatchers?: E extends object ? O.Partial<E, 'deep'> : string,
        hint?: string,
      ): Promise<void>;
    }

    interface EventBridgeMatchers {
      toHaveEventMatchingObject<TDetailType extends string, TDetail>(
        expected: O.Partial<EventBridgeEvent<TDetailType, TDetail>, 'deep'>,
      ): Promise<void>;
      toHaveEventMatchingObjectTimes<TDetailType extends string, TDetail>(
        expected: O.Partial<EventBridgeEvent<TDetailType, TDetail>, 'deep'>,
        times: number,
      ): Promise<void>;
    }

    type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

    interface Expect {
      // Hack: strict any check
      // TypeScript overloads match the first matching signature
      // meaning that calling `expect(any)` would always match the first custom overload
      // (because `any` matches anything)
      // but making (actual: any) the first overload would match custom helpers too.
      // this hack is for strict `any` matching. i.e. when calling expect()
      // with an explicit type of any. Other types will either match custom ones,
      // or the "default" `any` matcher from jest.
      <T>(actual: IfAny<T, T, never>): JestMatchers<T>;

      // AppSync matchers overload
      <T extends MatcherHelper<'appSyncMappingTemplate'>>(
        actual: T,
      ): AndNot<EvaluateMatchers>;

      // DynamoDB matchers overload
      <T extends MatcherHelper<'dynamodbItem'>>(
        actual: T,
      ): AndNot<ExistenceMatchers>;

      // S3 Object matchers overload
      <T extends MatcherHelper<'s3Object'>>(
        actual: T,
      ): AndNot<ExistenceMatchers>;

      // Cognito User matchers overload
      <T extends MatcherHelper<'cognitoUser'>>(
        actual: T,
      ): AndNot<ExistenceMatchers>;

      // EventBridgeSpy matchers overload
      <T extends EventBridgeSpy>(spy: T): AndNot<EventBridgeMatchers>;
    }
  }
}
