import { MatcherFunction } from '../internal';
import { MatcherState } from 'expect';
import {
  assertMatcherHelperInputType,
  IMatcherHelperInput,
} from '../../helpers/internal';
import * as mappingTemplates from './mapping-templates';
import * as jsResolvers from './js-resolvers';

/**
 * Assert that the resolver element evaluates to the expected value.
 */
export const toEvaluateTo: MatcherFunction = async function (
  this: MatcherState,
  input: IMatcherHelperInput,
  ...rest: any
) {
  const item = assertMatcherHelperInputType(
    'toEvaluateTo',
    ['appSyncMappingTemplate', 'appSyncResolver'],
    input,
  );

  const { _slsJestHelperName } = item;
  switch (_slsJestHelperName) {
    case 'appSyncMappingTemplate':
      return mappingTemplates.toEvaluateTo.call(this, item, ...rest);
    case 'appSyncResolver':
      return jsResolvers.toEvaluateTo.call(this, item, ...rest);
  }
};

/**
 * Assert that the resolver element evaluates to the expected snapshot.
 */
export const toEvaluateToSnapshot: MatcherFunction = async function (
  this: MatcherState,
  input: IMatcherHelperInput,
  ...rest: any
) {
  const item = assertMatcherHelperInputType(
    'toEvaluateTo',
    ['appSyncMappingTemplate', 'appSyncResolver'],
    input,
  );

  const { _slsJestHelperName } = item;
  switch (_slsJestHelperName) {
    case 'appSyncMappingTemplate':
      return mappingTemplates.toEvaluateToSnapshot.call(this, item, ...rest);
    case 'appSyncResolver':
      return jsResolvers.toEvaluateToSnapshot.call(this, item, ...rest);
  }
};

/**
 * Assert that the resolver element evaluates to the expected inline snapshot.
 */
export const toEvaluateToInlineSnapshot: MatcherFunction = async function (
  this: MatcherState,
  input: IMatcherHelperInput,
  ...rest: any
) {
  const item = assertMatcherHelperInputType(
    'toEvaluateTo',
    ['appSyncMappingTemplate', 'appSyncResolver'],
    input,
  );

  const { _slsJestHelperName } = item;
  switch (_slsJestHelperName) {
    case 'appSyncMappingTemplate':
      return mappingTemplates.toEvaluateToInlineSnapshot.call(
        this,
        item,
        ...rest,
      );
    case 'appSyncResolver':
      return jsResolvers.toEvaluateToInlineSnapshot.call(this, item, ...rest);
  }
};
