import { MatcherState } from 'expect';
import {
  assertMatcherHelperInputType,
  IMatcherHelperInput,
} from '../helpers/internal';
import * as dynamodb from './dynamodb.internal';
import { MatcherFunction } from './internal';

/**
 * Assert that the input element exists.
 */
export const toExist: MatcherFunction = async function (
  this: MatcherState,
  input: IMatcherHelperInput,
) {
  const item = assertMatcherHelperInputType('toExist', ['dynamodbItem'], input);

  const { _helperName } = item;
  switch (_helperName) {
    case 'dynamodbItem':
      return dynamodb.toExist.call(this, item);
  }
};

/**
 * Assert that the input element exists and matches the expected object.
 */
export const toExistAndMatchObject: MatcherFunction = async function (
  this: MatcherState,
  input: IMatcherHelperInput,
  expected: Record<string, unknown>,
) {
  const item = assertMatcherHelperInputType(
    'toExistAndMatchObject',
    ['dynamodbItem'],
    'input',
  );

  const { _helperName } = item;
  switch (_helperName) {
    case 'dynamodbItem':
      return dynamodb.toExistAndMatchObject.call(this, item, expected);
  }
};

/**
 * Assert that the input element exists and matches the snapshot.
 */
export const toExistAndMatchSnapshot: MatcherFunction = async function (
  this: MatcherState,
  input: IMatcherHelperInput,
  ...rest: any
) {
  const item = assertMatcherHelperInputType(
    'toExistAndMatchSnapshot',
    ['dynamodbItem'],
    input,
  );

  const { _helperName } = item;
  switch (_helperName) {
    case 'dynamodbItem':
      return dynamodb.toExistAndMatchSnapshot.call(this, item, ...rest);
  }
};

/**
 * Assert that the input element exists and matches the inline snapshot.
 */
export const toExistAndMatchInlineSnapshot: MatcherFunction = async function (
  this: MatcherState,
  input: IMatcherHelperInput,
  ...rest: any
) {
  const item = assertMatcherHelperInputType(
    'toExistAndMatchInlineSnapshot',
    ['dynamodbItem'],
    input,
  );

  const { _helperName } = item;
  switch (_helperName) {
    case 'dynamodbItem':
      return dynamodb.toExistAndMatchInlineSnapshot.call(this, item, ...rest);
  }
};
