import { MatcherState } from 'expect';
import {
  assertMatcherHelperInputType,
  IMatcherHelperInput,
} from '../helpers/internal';
import {
  toExist as dynamodbToExist,
  toExistAndMatchObject as dynamodbToExistAndMatchObject,
  toExistAndMatchSnapshot as dynamodbToExistAndMatchSnapshot,
  toExistAndMatchInlineSnapshot as dynamodbToExistAndMatchInlineSnapshot,
} from './dynamodb.internal';
import { MatcherFunction } from './internal';

/**
 * Assert that the input element exists.
 */
export const toExist: MatcherFunction = async function (
  this: MatcherState,
  input: IMatcherHelperInput,
) {
  const item = assertMatcherHelperInputType(input, 'toExist', ['dynamodbItem']);

  const { _helperName } = item;
  switch (_helperName) {
    case 'dynamodbItem':
      return dynamodbToExist.call(this, item);
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
  const item = assertMatcherHelperInputType(input, 'toExistAndMatchObject', [
    'dynamodbItem',
  ]);

  const { _helperName } = item;
  switch (_helperName) {
    case 'dynamodbItem':
      return dynamodbToExistAndMatchObject.call(this, item, expected);
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
  const item = assertMatcherHelperInputType(input, 'toExistAndMatchSnapshot', [
    'dynamodbItem',
  ]);

  const { _helperName } = item;
  switch (_helperName) {
    case 'dynamodbItem':
      return dynamodbToExistAndMatchSnapshot.call(this, item, ...rest);
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
    input,
    'toExistAndMatchInlineSnapshot',
    ['dynamodbItem'],
  );

  const { _helperName } = item;
  switch (_helperName) {
    case 'dynamodbItem':
      return dynamodbToExistAndMatchInlineSnapshot.call(this, item, ...rest);
  }
};
