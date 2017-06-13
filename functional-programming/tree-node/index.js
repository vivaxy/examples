/**
 * @since 2017-06-13 19:14:57
 * @author vivaxy
 */

const createTreeNode = (val, left, right) => {
    return (x) => {
        if (x === 0) {
            return val;
        }
        if (x < 0) {
            return left;
        }
        return right;
    };
};

const getValue = (treeNode) => {
    return treeNode(0);
};

const getLeft = (treeNode) => {
    return treeNode(-1);
};

const getRight = (treeNode) => {
    return treeNode(1);
};

const treeNode1 = createTreeNode(
    4,
    createTreeNode(
        2,
        createTreeNode(1, null, null),
        createTreeNode(3, null, null)
    ),
    createTreeNode(
        6,
        createTreeNode(5, null, null),
        createTreeNode(7, null, null)
    )
);
console.log('getValue(treeNode1)', '=', getValue(treeNode1)); // => 4
const treeNode2 = getLeft(treeNode1);
console.log('getValue(treeNode2)', '=', getValue(treeNode2)); // => 2

const logTreeNode = (treeNode) => {
    if (!treeNode) {
        return '';
    }
    const nextLeftLog = logTreeNode(getLeft(treeNode));
    const nextRightLog = logTreeNode(getRight(treeNode));
    if (!nextLeftLog && !nextRightLog) {
        return getValue(treeNode);
    }
    return getValue(treeNode) + '(' + nextLeftLog + ',' + nextRightLog + ')';
};

console.log(logTreeNode(treeNode1));
