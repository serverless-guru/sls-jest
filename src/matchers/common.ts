import { MatcherState } from 'expect';
import {
  assertMatcherHelperInputType,
  IMatcherHelperInput,
} from '../helpers/internal';
import * as dynamodb from './dynamodb.internal';
import * as s3 from './s3.internal';
import { MatcherFunction } from './internal';

/**
 * Assert that the input element exists.
 */
export const toExist: MatcherFunction = async function (
  this: MatcherState,
  input: IMatcherHelperInput,
) {
  const item = assertMatcherHelperInputType(
    'toExist',
    ['dynamodbItem', 's3Object'],
    input,
  );

  const { _helperName } = item;
  switch (_helperName) {
    case 'dynamodbItem':
      return dynamodb.toExist.call(this, item);
    case 's3Object':
      return s3.toExist.call(this, item);
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
    ['dynamodbItem', 's3Object'],
    input,
  );

  const { _helperName } = item;
  switch (_helperName) {
    case 'dynamodbItem':
      return dynamodb.toExistAndMatchObject.call(this, item, expected);
    case 's3Object':
      return s3.toExistAndMatchObject.call(this, item, expected);
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
    ['dynamodbItem', 's3Object'],
    input,
  );

  const { _helperName } = item;
  switch (_helperName) {
    case 'dynamodbItem':
      return dynamodb.toExistAndMatchSnapshot.call(this, item, ...rest);
    case 's3Object':
      return s3.toExistAndMatchSnapshot.call(this, item, ...rest);
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
    ['dynamodbItem', 's3Object'],
    input,
  );

  const { _helperName } = item;
  switch (_helperName) {
    case 'dynamodbItem':
      return dynamodb.toExistAndMatchInlineSnapshot.call(this, item, ...rest);
    case 's3Object':
      return s3.toExistAndMatchInlineSnapshot.call(this, item, ...rest);
  }
};
