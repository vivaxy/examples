/**
 * @since 2019-04-22 10:52
 * @author vivaxy
 */

interface LabeledValue {
  label: string;
}

function printLabel(labeledObj: LabeledValue) {
  console.log(labeledObj.label);
}

const myObj = { size: 10, label: 'Size 10 Object' };
printLabel(myObj);
