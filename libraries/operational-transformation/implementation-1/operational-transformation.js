/**
 * @since 2021-08-01
 * @author vivaxy
 */
export const TYPES = {
  INSERT: 'insert',
  DELETE: 'delete',
};

const ITEM_TYPES = {
  RETAIN: 0,
  DELETE: -1,
  INSERT: 1,
};

export function forEachRange(ranges, visitor) {
  for (let i = 0; i < ranges.length / 2; i++) {
    visitor(ranges[i * 2], ranges[i * 2 + 1]);
  }
}

function getOriginalPosition(items, i = items.length - 1) {
  return items.slice(0, i + 1).filter(function (item) {
    return item === ITEM_TYPES.RETAIN || item === ITEM_TYPES.DELETE;
  }).length;
}

function getCurrentPosition(items, i = items.length - 1) {
  return items.slice(0, i + 1).filter(function (item) {
    return item === ITEM_TYPES.RETAIN || item === ITEM_TYPES.INSERT;
  }).length;
}

function createItemsByOp(op) {
  const items = [];

  forEachRange(op.ranges, function (pos, value) {
    while (pos > getOriginalPosition(items)) {
      items.push(ITEM_TYPES.RETAIN);
    }

    if (op.type === TYPES.INSERT) {
      for (
        let i = 0;
        i < pos + value.length - getOriginalPosition(items);
        i++
      ) {
        items.push(ITEM_TYPES.INSERT);
      }
    } else if (op.type === TYPES.DELETE) {
      while (pos + value > getOriginalPosition(items)) {
        items.push(ITEM_TYPES.DELETE);
      }
    } else {
      throw errors.unexpectedType(op.type);
    }
  });

  return items;
}

function compareItemsByOp(items, op) {
  const ranges = [];
  let itemIndex = 0;
  forEachRange(op.ranges, function (pos, value) {
    while (
      pos > getOriginalPosition(items, itemIndex) &&
      itemIndex < items.length
    ) {
      itemIndex++;
    }
    if (pos > getOriginalPosition(items, itemIndex)) {
      // out of items
      ranges.push(
        getCurrentPosition(items, itemIndex) -
          getOriginalPosition(items, itemIndex) +
          pos,
        value,
      );
    }
    // in items
    if (op.type === TYPES.INSERT) {
      ranges.push(
        getCurrentPosition(items, itemIndex) -
          getOriginalPosition(items, itemIndex) +
          pos,
        value,
      );
    } else if (op.type === TYPES.DELETE) {
      const toDelete = [];
      for (let i = 0; i < value; i++) {
        itemIndex++;
        while (items[itemIndex] === ITEM_TYPES.INSERT) {
          itemIndex++;
        }
        const item = items[itemIndex];
        if (item === ITEM_TYPES.RETAIN || item === undefined) {
          // delete
          toDelete.push(
            getCurrentPosition(items, itemIndex) -
              getOriginalPosition(items, itemIndex) +
              pos +
              i,
          );
        } else if (item === ITEM_TYPES.DELETE) {
          // nothing
        } else {
          throw errors.unexpectedItem(item);
        }
      }

      // toDelete -> ranges
      let i = 0;
      while (i < toDelete.length) {
        const pos = toDelete[i];
        ranges.push(pos);
        while (i + 1 < toDelete.length && toDelete[i + 1] === toDelete[i] + 1) {
          i++;
        }
        ranges.push(toDelete[i] - pos + 1);
        i++;
      }
    } else {
      throw errors.unexpectedType(op.type);
    }
  });
  return {
    type: op.type,
    ranges,
  };
}

export function transform(prevOp, op) {
  const items = createItemsByOp(prevOp);
  const transformedOp = compareItemsByOp(items, op);
  return transformedOp;
}

export const errors = {
  unexpectedType(type) {
    return new Error('Unexpected operation type: ' + type);
  },
  unexpectedItem(item) {
    return new Error('Unexpected item: ' + item);
  },
};
