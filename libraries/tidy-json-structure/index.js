/**
 * @since 20180712 10:18
 * @author vivaxy
 *  1. Remove circular structure
 *  2. Remove function values
 *  3. Remove undefined values
 *  4. Remove prototype values
 */

module.exports = function tidyJsonStructure(data, parentObjects = []) {
  let visitedObjects = [];
  let traverse = null;
  let newData = null;

  if (Object.prototype.toString.call(data) === '[object Array]') {
    newData = [];
    traverse = function(array, visitor) {
      array.forEach((value, index) => {
        visitor(value, index);
      });
    };
  } else if (Object.prototype.toString.call(data) === '[object Object]') {
    newData = {};
    traverse = function(object, visitor) {
      for (let key in object) {
        if (object.hasOwnProperty(key)) {
          visitor(object[key], key);
        }
      }
    };
  } else {
    return data;
  }

  traverse(data, (item, key) => {
    if (typeof item === 'object') {
      if (parentObjects.indexOf(item) === -1) {
        visitedObjects.push(item);
        newData[key] = item;
      }
    } else if (typeof item !== 'function' && item !== undefined) {
      newData[key] = item;
    }
  });

  traverse(newData, (item, key) => {
    if (typeof item === 'object') {
      newData[key] = tidyJsonStructure(
        item,
        parentObjects.concat(visitedObjects),
      );
    }
  });

  return newData;
};
