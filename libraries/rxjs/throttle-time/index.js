const {
  fromEvent,
  operators: { throttleTime, scan },
} = rxjs;

const button = document.querySelector('button');
fromEvent(button, 'click')
  .pipe(
    throttleTime(1000),
    scan((count) => count + 1, 0),
  )
  .subscribe((count) => console.log(`Clicked ${count} times`));
