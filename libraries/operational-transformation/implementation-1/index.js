/**
 * @since 2021-07-30
 * @author vivaxy
 */
import {
  TYPES,
  forEachRange,
  errors,
  transform,
} from './operational-transformation.js';
import { test } from './test.js';

function applyOperation(text, op) {
  const { type, ranges } = op;
  switch (type) {
    case TYPES.INSERT:
      forEachRange(ranges, function (pos, str) {
        text = text.slice(0, pos) + str + text.slice(pos);
      });
      return text;
    case TYPES.DELETE:
      forEachRange(ranges, function (pos, len) {
        text = text.slice(0, pos) + text.slice(pos + len);
      });
      return text;
    default:
      throw errors.unexpectedType(type);
  }
}

function applyOperationsWithoutTransform(text, ops) {
  return ops.reduce(function (res, op) {
    return applyOperation(res, op);
  }, text);
}

function applyOperationsWithTransform(text, ops) {
  return ops.reduce(function (res, op, i) {
    const prevOps = ops.slice(0, i);
    const transformedOp = prevOps.reduce(function (transformed, prevOp) {
      return transform(prevOp, transformed);
    }, op);
    return applyOperation(res, transformedOp);
  }, text);
}

function parseOperations(operations) {
  return operations.split(';').map(function (operation) {
    const [_type, position, value] = operation.split(/\(|,|\)/g);
    const type = _type.trim();
    return {
      type: type,
      ranges: [
        Number(position),
        type === TYPES.INSERT ? value.trim() : Number(value),
      ],
    };
  });
}

const FIXTURES = [
  // insert 1 char, delete 1 char
  /// insert + insert
  {
    text: 'A',
    operations: 'insert(0, X); insert(1, Y)',
    expected: 'XAY',
  },
  /// insert + delete
  {
    text: 'A',
    operations: 'insert(0, X); delete(0, 1)',
    expected: 'X',
  },
  /// delete + delete
  {
    text: 'A',
    operations: 'delete(0, 1); delete(0, 1)',
    expected: '',
  },
  // delete across insert
  {
    text: 'AB',
    operations: 'delete(0, 2); insert(1, X)',
    expected: 'X',
  },
  // insert in same pos, expected depends on the timestamp
];

test('apply operations with transform', function (expect) {
  FIXTURES.forEach(function ({ text, operations, expected }) {
    const ops = parseOperations(operations);
    expect(applyOperationsWithTransform(text, ops), expected, operations);
    expect(
      applyOperationsWithTransform(text, ops.reverse()),
      expected,
      operations,
    );
  });
});
