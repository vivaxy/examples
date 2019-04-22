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

interface SquareConfig {
  color?: string;
  width?: number;
}

interface SquareConfig2 {
  color?: string;
  width?: number;
  [propName: string]: any;
}

interface ISquare {
  color: string;
  area: number;
}

function createSquare(config: SquareConfig): ISquare {
  let newSquare = { color: 'white', area: 100 };
  if (config.color) {
    newSquare.color = config.color;
  }
  if (config.width) {
    newSquare.area = config.width * config.width;
  }
  return newSquare;
}

function createSquare2(config: SquareConfig2): ISquare {
  let newSquare = { color: 'white', area: 100 };
  if (config.color) {
    newSquare.color = config.color;
  }
  if (config.width) {
    newSquare.area = config.width * config.width;
  }
  return newSquare;
}

const mySquare = createSquare({ color: 'black' });
console.log(mySquare);
const mySquare2 = createSquare({ width: 100, opacity: 0.5 } as SquareConfig);

// error: 'colour' not expected in type 'SquareConfig'
// const mySquare3 = createSquare({ colour: "red", width: 100 });
const mySquare3 = createSquare2({ width: 100, opacity: 0.5 } as SquareConfig);

interface Point {
  readonly x: number;
  readonly y: number;
}

const p1: Point = { x: 10, y: 20 };
// p1.x = 0 // error!
console.log(p1.x);

let a: number[] = [1, 2, 3, 4];
const ro: ReadonlyArray<number> = a;
// ro[0] = 12; // error!
// ro.push(5); // error!
// ro.length = 100; // error!
// a = ro; // error!
a = ro as number[];

// Variables use const whereas properties use readonly.

interface SearchFunc {
  (source: string, subString: string): boolean;
}

const mySearch: SearchFunc = function(source: string, subString: string) {
  let result = source.search(subString);
  return result > -1;
};

interface StringArray {
  [index: number]: string;
}

const myArray: StringArray = ['Bob', 'Fred'];
const myStr: string = myArray[0];

interface ClockConstructor {
  new (h: number, m: number): ClockInterface;
}

interface ClockInterface {
  currentTime: Date;
  setTime(d: Date): void;
}

const Clock: ClockConstructor = class Clock implements ClockInterface {
  currentTime: Date;
  constructor(h: number, m: number) {}
  setTime(d: Date) {
    this.currentTime = d;
  }
};

interface Shape {
  color: string;
}

interface PenStroke {
  penWidth: number;
}

interface Square extends Shape, PenStroke {
  sideLength: number;
}

const square = <Square>{};
square.color = 'blue';
square.sideLength = 10;
square.penWidth = 5.0;

interface Counter {
  (start: number): string;
  interval: number;
  reset(): void;
}

const counter = <Counter>function(start: number) {};
counter.interval = 123;
counter.reset = function() {};

// Interfaces Extending Classes
class Control {
  private state: any;
}

interface SelectableControl extends Control {
  select(): void;
}

class Button extends Control implements SelectableControl {
  select() {}
}

class TextBox extends Control {
  select() {}
}
