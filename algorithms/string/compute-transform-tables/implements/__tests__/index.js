/**
 * @since 20180813 13:44
 * @author vivaxy
 */

const test = require('ava');
const computeTransformTables = require('../index.js');

const operation = {
  COPY: 1,
  REPLACE: 2,
  DELETE: 4,
  INSERT: 8,
};

test('table test ', (t) => {
  const cost = {
    COPY: -1,
    REPLACE: 1,
    DELETE: 2,
    INSERT: 2,
  };

  const s1 = 'ACAAGC';
  const s2 = 'CCGT';
  const transformTables = computeTransformTables(s1, s2, operation, cost);
  t.is(transformTables.operations[s1.length][s2.length], operation.REPLACE);
  t.is(transformTables.costs[s1.length][s2.length], 4);
});
