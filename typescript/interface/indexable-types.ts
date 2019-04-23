/**
 * @since 2019-04-23 12:51
 * @author vivaxy
 */
interface StringArray {
  [index: number]: string;
}

const myArray: StringArray = ['Bob', 'Fred'];
const myStr: string = myArray[0]; // ok
myArray['key1'] = 'Alice'; // ok
myArray[1] = 1; // Type '1' is not assignable to type 'string'.

interface StringArray2 {
  [index: number]: string, // Numeric index type 'string' is not assignable to string index type 'number'.
  [index: string]: number,
}

interface NumberDictionary {
  [index: string]: number;
  length: number; // ok
  name: string; // Property 'name' of type 'string' is not assignable to string index type 'number'.
}
