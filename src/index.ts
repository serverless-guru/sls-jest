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
      /**
       * Asserts that the received AppSync resolver evaluation
       * matches the expected object.
       *
       * @param expected The expected object.
       */
      toEvaluateTo<E extends object>(expected: E): Promise<void>;

      /**
       * Asserts that the received AppSync resolver evaluation
       * matches the existing snapshot.
       *
       * @param snapshotName Optional snapshot name.
       */
      toEvaluateToSnapshot(snapshotName?: string): Promise<void>;

      /**
       * Asserts that the received AppSync resolver evaluation
       * matches the existing snapshot.
       *
       * @param propertyMatchers The snapshot properties.
       * @param snapshotName Optional snapshot name.
       */
      toEvaluateToSnapshot<U extends object>(
        propertyMatchers: Partial<U>,
        snapshotName?: string,
      ): Promise<void>;

      /**
       * Asserts that the received AppSync resolver evaluation
       * matches the inline snapshot.
       *
       * @param snapshot The expected snapshot.
       */
      toEvaluateToInlineSnapshot(snapshot?: string): Promise<void>;
      /**
       * Asserts that the received AppSync resolver evaluation
       * matches the inline snapshot.
       *
       * @param propertyMatchers The snapshot properties.
       * @param snapshot The expected snapshot.
       */
      toEvaluateToInlineSnapshot<U extends object>(
        propertyMatchers: Partial<U>,
        snapshot?: string,
      ): Promise<void>;
    }

    interface ExistenceMatchers {
      /**
       * Asserts that the received value exists.
       */
      toExist(): Promise<void>;

      /**
       * Asserts that the received value exists and matches the expected object.
       *
       * @param expected The expected object.
       */
      toExistAndMatchObject<E extends object>(
        expected: O.Partial<E, 'deep'>,
      ): Promise<void>;

      /**
       * Asserts that the received value exists and matches the expected snapshot.
       * @param snapshotName Optional snapshot name.
       */
      toExistAndMatchSnapshot(snapshotName?: string): Promise<void>;

      /**
       * Asserts that the received value exists and matches the expected snapshot.
       * @param propertyMatchers The snapshot properties.
       * @param snapshotName Optional snapshot name.
       */
      toExistAndMatchSnapshot<U extends object>(
        propertyMatchers: Partial<U>,
        snapshotName?: string,
      ): Promise<void>;

      /**
       * Asserts that the received value exists and matches the expected snapshot.
       * @param snapshot The expected snapshot.
       */
      toExistAndMatchInlineSnapshot(snapshot?: string): Promise<void>;

      /**
       * Asserts that the received value exists and matches the expected snapshot.
       * @param propertyMatchers The snapshot properties.
       * @param snapshotName Optional snapshot name.
       */
      toExistAndMatchInlineSnapshot<U extends object>(
        propertyMatchers: Partial<U>,
        snapshot?: string,
      ): Promise<void>;
    }

    interface EventBridgeMatchers {
      /**
       * Asserts the the spied EventBridge has received an
       * event matching the expected object.
       *
       * @param expected The expected object.
       */
      toHaveEventMatchingObject<TDetailType extends string, TDetail>(
        expected: O.Partial<EventBridgeEvent<TDetailType, TDetail>, 'deep'>,
      ): Promise<void>;

      /**
       * Asserts the the spied EventBridge has received an
       * event matching the expected object a certain number of times.
       *
       * @param expected The expected object.
       * @param times The (exact) number of times the event should have been received.
       */
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

      // AppSync resolver matchers overload
      <T extends MatcherHelper<'appSyncMappingTemplate' | 'appSyncResolver'>>(
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
