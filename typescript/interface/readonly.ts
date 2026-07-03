interface Point {
  readonly x: number;
  readonly y: number;
}

const point: Point = { x: 0, y: 0 };
point.x = 1; // Cannot assign to 'x' because it is a read-only property.

// Variables use const whereas properties use readonly.
