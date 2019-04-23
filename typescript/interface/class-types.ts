/**
 * @since 2019-04-23 01:03
 * @author vivaxy
 */

// Only the static side got checked. Constructor sits in the static side.
interface ClockConstructor {
  new (h: number, m: number): ClockInterface;
}

// Only instance side got checked.
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
