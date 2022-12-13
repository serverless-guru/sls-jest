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
    ['dynamodbItem', 'dynamodbQueryItems', 's3Object'],
    input,
  );

  const { _slsJestHelperName } = item;
  switch (_slsJestHelperName) {
    case 'dynamodbItem':
      return dynamodb.itemToExist.call(this, item);
    case 'dynamodbQueryItems':
      return dynamodb.queryItemsToExist.call(this, item);
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
    ['dynamodbItem', 'dynamodbQueryItems', 's3Object'],
    input,
  );

  const { _slsJestHelperName } = item;
  switch (_slsJestHelperName) {
    case 'dynamodbItem':
      return dynamodb.itemToExistAndMatchObject.call(this, item, expected);
    case 'dynamodbQueryItems':
      return dynamodb.queryItemsToExistAndMatchObject.call(
        this,
        item,
        expected,
      );
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
    ['dynamodbItem', 'dynamodbQueryItems', 's3Object'],
    input,
  );

  const { _slsJestHelperName } = item;
  switch (_slsJestHelperName) {
    case 'dynamodbItem':
      return dynamodb.itemToExistAndMatchSnapshot.call(this, item, ...rest);
    case 'dynamodbQueryItems':
      return dynamodb.queryItemsToExistAndMatchSnapshot.call(
        this,
        item,
        ...rest,
      );
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
    ['dynamodbItem', 'dynamodbQueryItems', 's3Object'],
    input,
  );

  const { _slsJestHelperName } = item;
  switch (_slsJestHelperName) {
    case 'dynamodbItem':
      return dynamodb.itemToExistAndMatchInlineSnapshot.call(
        this,
        item,
        ...rest,
      );
    case 'dynamodbQueryItems':
      return dynamodb.queryItemsToExistAndMatchInlineSnapshot.call(
        this,
        item,
        ...rest,
      );
    case 's3Object':
      return s3.toExistAndMatchInlineSnapshot.call(this, item, ...rest);
  }
};

/**
 * Assert that the input elements exists and have a given length.
 */
export const toExistAndHaveLength: MatcherFunction = async function (
  this: MatcherState,
  input: IMatcherHelperInput,
  length: number,
) {
  const item = assertMatcherHelperInputType(
    'toExistAndHaveLength',
    ['dynamodbQueryItems'],
    input,
  );

  const { _slsJestHelperName } = item;
  switch (_slsJestHelperName) {
    case 'dynamodbQueryItems':
      return dynamodb.queryItemsToExistAndHaveLength.call(this, item, length);
  }
};
