/**
 * @since 2018-12-03 15:38
 * @author vivaxy
 */

const {
  fromEvent,
  operators: { scan },
} = rxjs;

const button = document.querySelector('button');
fromEvent(button, 'click')
  .pipe(scan((count) => count + 1, 0))
  .subscribe((count) => console.log(`Clicked ${count} times.`));
