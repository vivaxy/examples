/**
 * @since 2019-04-23 11:24
 * @author vivaxy
 */
const readonlyArray: ReadonlyArray<number> = [1, 2, 3];
readonlyArray[0] = 0; // Index signature in type 'readonly number[]' only permits reading.
readonlyArray.push(4); // Property 'push' does not exist on type 'readonly number[]'.
readonlyArray.length = 0; // Cannot assign to 'length' because it is a read-only property.
readonlyArray = [1]; // Cannot assign to 'readonlyArray' because it is a constant.

let readonlyArray2: ReadonlyArray<number> = [1, 2, 3];
readonlyArray2 = [1]; // ok

let array: number[] = [1, 2, 3];
readonlyArray2 = array; // ok
array = readonlyArray2; // Type 'readonly number[]' is missing the following properties from type 'number[]': pop, push, reverse, shift, and 3 more.
