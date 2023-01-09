/**
 * @since 2023-01-09 10:53
 * @author vivaxy
 */
import yoga, { Node } from 'yoga-layout';

const root = Node.create();
root.setWidth(500);
root.setHeight(300);
root.setJustifyContent(yoga.JUSTIFY_CENTER);
root.setAlignItems(yoga.ALIGN_CENTER);
root.setFlexDirection(yoga.FLEX_DIRECTION_ROW);

const node1 = Node.create();
node1.setWidth(100);
node1.setHeight(100);

const node2 = Node.create();
node2.setWidth(100);
node2.setHeight(100);

root.insertChild(node1, 0);
root.insertChild(node2, 1);

root.calculateLayout(500, 300, yoga.DIRECTION_LTR);
console.log(root.getComputedLayout());
// { left: 0, right: 0, top: 0, bottom: 0, width: 500, height: 300 }
console.log(node1.getComputedLayout());
// { left: 150, right: 0, top: 100, bottom: 0, width: 100, height: 100 }
console.log(node2.getComputedLayout());
// { left: 250, right: 0, top: 100, bottom: 0, width: 100, height: 100 }
