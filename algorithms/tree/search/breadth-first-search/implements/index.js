/**
 * @since 20180309 12:13
 * @author vivaxy
 * @see https://www.wikiwand.com/en/Tree_traversal#/Depth-first_search_2
 */

const treeNodeIterate = (node, visit) => {
    if (node === null) {
        return;
    }
    let queue = [node];
    while (queue.length) {
        const newQueue = [];
        while (queue.length) {
            const current = queue.shift();
            visit(current.val);
            if (current.left) {
                newQueue.push(current.left);
            }
            if (current.right) {
                newQueue.push(current.right);
            }
        }
        queue = newQueue;
    }
};
exports.treeNodeIterate = treeNodeIterate;

const treeNodeRecurse = (node, visit) => {
    const depths = [];
    const recurse = (node, depth) => {
        if (node === null) {
            return;
        }
        if (depth >= depths.length) {
            depths.push([]);
        }
        depths[depth].push(node);
        recurse(node.left, depth + 1);
        recurse(node.right, depth + 1);
    };
    recurse(node, 0);
    depths.map((row) => {
        row.map((node) => {
            visit(node.val);
        });
    });
};
exports.treeNodeRecurse = treeNodeRecurse;
