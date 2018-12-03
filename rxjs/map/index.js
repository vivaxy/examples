/**
 * @since 2018-12-03 16:20
 * @author vivaxy
 */

const { fromEvent, operators: { throttleTime, map, scan } } = rxjs;

const button = document.querySelector('button');
fromEvent(button, 'click')
  .pipe(throttleTime(1000), map(e => e.clientX), scan((c, x) => c + x, 0))
  .subscribe(c => console.log(c));
