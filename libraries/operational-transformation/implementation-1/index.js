/**
 * @since 2021-07-30
 * @author vivaxy
 */
const TYPES = {
  INSERT: 'insert',
  DELETE: 'delete',
};

const ops = [
  // data: [pos, str, pos, str, ...]
  // data: [pos, len, pos, len, ...]
  { type: TYPES.INSERT, ranges: [0, 'X'] },
  { type: TYPES.DELETE, ranges: [2, 1] },
];

function forEachRange(ranges, visitor) {
  for (let i = 0; i < ranges.length / 2; i++) {
    visitor(ranges[i * 2], ranges[i * 2 + 1]);
  }
}

function transform(prevOp, op) {
  if (prevOp.type === TYPES.INSERT && op.type === TYPES.INSERT) {
    forEachRange(op.ranges, function (pos, str) {
      // TODO:
      forEachRange(prevOp.ranges, function (_pos, _str) {});
    });
  }
  // TODO: ...
}

const ERROR = {
  unexpectedType(type) {
    return new Error('Unexpected operation type: ' + type);
  },
};

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
      throw ERROR.unexpectedType(type);
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

console.assert(
  applyOperationsWithoutTransform('ABC', ops) === 'XAC',
  'applyOperationsWithoutTransform',
);

console.assert(
  applyOperationsWithTransform('ABC', ops) === 'XAB',
  'applyOperationsWithoutTransform',
);
