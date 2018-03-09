/**
 * @since 20180309 12:13
 * @author vivaxy
 * @see https://www.wikiwand.com/en/Tree_traversal#/Depth-first_search_2
 */

const treeNodePreorderIterate = (node, visit) => {
    if (node === null) {
        return;
    }
    const stack = [node];
    while (stack.length) {
        const current = stack.pop();
        visit(current.val);
        if (current.right) {
            stack.push(current.right);
        }
        if (current.left) {
            stack.push(current.left);
        }
    }
};
exports.treeNodePreorderIterate = treeNodePreorderIterate;

const treeNodePreorderRecurse = (node, visit) => {
    if (node === null) {
        return;
    }
    visit(node.val);
    treeNodePreorderRecurse(node.left, visit);
    treeNodePreorderRecurse(node.right, visit);
};
exports.treeNodePreorderRecurse = treeNodePreorderRecurse;

const treeNodeInorderIterate = (node, visit) => {
    const stack = [];
    while (stack.length || node !== null) {
        if (node !== null) {
            stack.push(node);
            node = node.left;
        } else {
            node = stack.pop();
            visit(node.val);
            node = node.right;
        }
    }
};
exports.treeNodeInorderIterate = treeNodeInorderIterate;

const treeNodeInorderRecurse = (node, visit) => {
    if (node === null) {
        return;
    }
    treeNodeInorderRecurse(node.left, visit);
    visit(node.val);
    treeNodeInorderRecurse(node.right, visit);
};
exports.treeNodeInorderRecurse = treeNodeInorderRecurse;

const treeNodePostorderIterate = (node, visit) => {
    const stack = [];
    let lastNodeVisited = null;
    while (stack.length || node !== null) {
        if (node !== null) {
            stack.push(node);
            node = node.left;
        } else {
            const peekNode = stack[stack.length - 1];
            if (peekNode.right !== null && lastNodeVisited !== peekNode.right) {
                node = peekNode.right;
            } else {
                visit(peekNode.val);
                lastNodeVisited = stack.pop();
            }
        }
    }
};
exports.treeNodePostorderIterate = treeNodePostorderIterate;

const treeNodePostorderRecurse = (node, visit) => {
    if (node === null) {
        return;
    }
    treeNodePostorderRecurse(node.left, visit);
    treeNodePostorderRecurse(node.right, visit);
    visit(node.val);
};
exports.treeNodePostorderRecurse = treeNodePostorderRecurse;
