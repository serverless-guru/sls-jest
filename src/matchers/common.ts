import { MatcherState } from 'expect';
import {
  assertMatcherHelperInput,
  IMatcherHelperInput,
} from '../helpers/internal';
import {
  toExist as dynamodbToExist,
  toExistAndMatchObject as dynamodbToExistAndMatchObject,
  toExistAndMatchSnapshot as dynamodbToExistAndMatchSnapshot,
  toExistAndMatchInlineSnapshot as dynamodbToExistAndMatchInlineSnapshot,
} from './dynamodb.internal';

type MatcherFunctionResult = {
  pass: boolean;
  message: () => string;
};

type MatcherFunction = (...args: any[]) => Promise<MatcherFunctionResult>;

export const toExist: MatcherFunction = async function (
  this: MatcherState,
  input: IMatcherHelperInput,
) {
  const item = assertMatcherHelperInput(input, 'toExist', ['dynamodbItem']);

  const { _helperName } = item;
  switch (_helperName) {
    case 'dynamodbItem':
      return dynamodbToExist.call(this, item);
  }
};

export const toExistAndMatchObject: MatcherFunction = async function (
  this: MatcherState,
  input: IMatcherHelperInput,
  expected: Record<string, unknown>,
) {
  const item = assertMatcherHelperInput(input, 'toExistAndMatchObject', [
    'dynamodbItem',
  ]);

  const { _helperName } = item;
  switch (_helperName) {
    case 'dynamodbItem':
      return dynamodbToExistAndMatchObject.call(this, item, expected);
  }
};

export const toExistAndMatchSnapshot: MatcherFunction = async function (
  this: MatcherState,
  input: IMatcherHelperInput,
  ...rest: any
) {
  const item = assertMatcherHelperInput(input, 'toExistAndMatchSnapshot', [
    'dynamodbItem',
  ]);

  const { _helperName } = item;
  switch (_helperName) {
    case 'dynamodbItem':
      return dynamodbToExistAndMatchSnapshot.call(this, item, ...rest);
  }
};

export const toExistAndMatchInlineSnapshot: MatcherFunction = async function (
  this: MatcherState,
  input: IMatcherHelperInput,
  ...rest: any
) {
  const item = assertMatcherHelperInput(
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
