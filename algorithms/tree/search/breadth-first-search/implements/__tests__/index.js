/**
 * @since 20180309 12:21
 * @author vivaxy
 */

const test = require('ava');

const { treeNode } = require('../../../tree-node/implements');

const { treeNodeIterate, treeNodeRecurse } = require('..');

const treeNode1 = treeNode(1);
treeNode1.left = treeNode(2);
treeNode1.right = treeNode(3);
treeNode1.left.left = treeNode(4);
treeNode1.left.right = treeNode(5);
treeNode1.right.left = treeNode(6);
treeNode1.right.right = treeNode(7);
treeNode1.left.left.left = treeNode(8);
treeNode1.left.left.right = treeNode(9);

test('treeNode iterate', (t) => {
    const nodeValues = [];
    treeNodeIterate(treeNode1, (val) => {
        nodeValues.push(val);
    });
    t.deepEqual(nodeValues, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('treeNode recurse', (t) => {
    const nodeValues = [];
    treeNodeRecurse(treeNode1, (val) => {
        nodeValues.push(val);
    });
    t.deepEqual(nodeValues, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});
