/**
 * @since 20180813 13:44
 * @author vivaxy
 * transform operation:
 *  - copy
 *  - replace
 *  - delete
 *  - insert
 */
module.exports = function computeTransformTables(s1, s2, operation, cost) {

  let costs = [];
  let operations = [];

  for (let i = 0; i <= s1.length; i++) {
    costs[i] = [];
    operations[i] = [];

    for (let j = 0; j <= s2.length; j++) {

      if (i === 0) {
        costs[i][j] = j * cost.INSERT;
        if (j !== 0) {
          operations[i][j] = operation.INSERT;
        }
        continue;
      }
      if (j === 0) {
        costs[i][j] = i * cost.DELETE;
        operations[i][j] = operation.DELETE;
        continue;
      }

      if (s1[i - 1] === s2[j - 1]) {
        costs[i][j] = costs[i - 1][j - 1] + cost.COPY;
        operations[i][j] = operation.COPY;
      } else {
        costs[i][j] = costs[i - 1][j - 1] + cost.REPLACE;
        operations[i][j] = operation.REPLACE;
      }

      if (costs[i - 1][j] + cost.DELETE < costs[i][j]) {
        costs[i][j] = costs[i - 1][j] + cost.DELETE;
        operations[i][j] = operation.DELETE;
      }

      if (costs[i][j - 1] + cost.INSERT < costs[i][j]) {
        costs[i][j] = costs[i][j - 1] + cost.INSERT;
        operations[i][j] = operation.INSERT;
      }

    }

  }

  return { costs, operations };
};
