/**
 * @since 2019-04-16 04:40
 * @author vivaxy
 */
const someValue: any = 'this is a string';
const stringLength: number = (<string>someValue).length;
console.log(stringLength);

const someValue2: any = 'this is another string';
const stringLength2: number = (someValue2 as string).length;
console.log(stringLength2);
