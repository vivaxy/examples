/**
 * @since 20180309 12:21
 * @author vivaxy
 */

const test = require('ava');

const { treeNode } = require('../../../implements/index.js');

const { treeNodePreorderIterate, treeNodePreorderRecurse, treeNodeInorderIterate, treeNodeInorderRecurse, treeNodePostorderIterate, treeNodePostorderRecurse } = require('..');

const treeNode1 = treeNode(1);
treeNode1.left = treeNode(2);
treeNode1.right = treeNode(3);
treeNode1.left.left = treeNode(4);
treeNode1.left.right = treeNode(5);

test('treeNode preorder iterate', (t) => {
  const nodeValues = [];
  treeNodePreorderIterate(treeNode1, (val) => {
    nodeValues.push(val);
  });
  t.deepEqual(nodeValues, [1, 2, 4, 5, 3]);
});

test('treeNode preorder recurse', (t) => {
  const nodeValues = [];
  treeNodePreorderRecurse(treeNode1, (val) => {
    nodeValues.push(val);
  });
  t.deepEqual(nodeValues, [1, 2, 4, 5, 3]);
});

test('treeNode inorder iterate', (t) => {
  const nodeValues = [];
  treeNodeInorderIterate(treeNode1, (val) => {
    nodeValues.push(val);
  });
  t.deepEqual(nodeValues, [4, 2, 5, 1, 3]);
});

test('treeNode inorder recurse', (t) => {
  const nodeValues = [];
  treeNodeInorderRecurse(treeNode1, (val) => {
    nodeValues.push(val);
  });
  t.deepEqual(nodeValues, [4, 2, 5, 1, 3]);
});

test('treeNode postorder iterate', (t) => {
  const nodeValues = [];
  treeNodePostorderIterate(treeNode1, (val) => {
    nodeValues.push(val);
  });
  t.deepEqual(nodeValues, [4, 5, 2, 3, 1]);
});

test('treeNode postorder recurse', (t) => {
  const nodeValues = [];
  treeNodePostorderRecurse(treeNode1, (val) => {
    nodeValues.push(val);
  });
  t.deepEqual(nodeValues, [4, 5, 2, 3, 1]);
});
