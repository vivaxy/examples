/**
 * @since 2019-04-23 01:07
 * @author vivaxy
 */
interface Shape {
  color: string;
}

interface PenStroke {
  penWidth: number;
}

interface Square extends Shape, PenStroke {
  sideLength: number;
}

let square1 = <Square>{};
square1.color = "blue";
square1.sideLength = 10;
square1.penWidth = 5.0;
square1.notOK = 'not ok'; // Property 'notOK' does not exist on type 'Square'.
