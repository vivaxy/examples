/**
 * @since 2017-06-12 10:02:30
 * @author vivaxy
 */

// create a linked list by closure
const createNode = (value, next) => {
    return (x) => {
        if (x) {
            return value;
        }
        return next;
    }
};

const getValue = (node) => {
    return node(true);
};

const getNext = (node) => {
    return node(false);
};

const linkedList1 = createNode(1, createNode(2, createNode(3, null)));
console.log('getValue(linkedList1)', '=', getValue(linkedList1)); // => 1

const linkedList2 = getNext(linkedList1);
console.log('getValue(linkedList2)', '=', getValue(linkedList2)); // => 2

const linkedList3 = getNext(linkedList2);
console.log('getValue(linkedList3)', '=', getValue(linkedList3)); // => 3
console.log('getNext(linkedList3)', '=', getNext(linkedList3)); // => null

// implement reversing linked list
/**
 * append value to the last
 * @param next
 * @param value
 */
const append = (next, value) => {
    if (next === null) {
        return createNode(value, null);
    }
    return createNode(getValue(next), append(getNext(next), value));
};

const reverse = (linkedList) => {
    if (linkedList === null) {
        return null;
    }
    return append(reverse(getNext(linkedList)), getValue(linkedList));
};

const logLinkedList = (linkedList) => {
    let current = linkedList;
    let structure = '';
    while (current !== null) {
        structure = structure + getValue(current) + ' -> ';
        current = getNext(current);
    }
    return structure + 'null';
};

const linkedList4 = reverse(linkedList1);
console.log(logLinkedList(linkedList4)); // => 3 -> 2 -> 1 -> null
