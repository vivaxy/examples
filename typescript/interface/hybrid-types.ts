/**
 * @since 2019-04-23 01:10
 * @author vivaxy
 */
interface Counter {
  (start: number): string;
  interval: number;
  reset(): void;
}

function getCounter(): Counter {
  const counter = <Counter>function (start: number) { };
  counter.interval = 123;
  counter.reset = function () { };
  return counter;
}

const c = getCounter();
c(10);
c.reset();
c.interval = 5.0;
