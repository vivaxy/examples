/**
 * @since 2018-12-03 19:40
 * @author vivaxy
 */

const { Subject, from } = rxjs;

const subject = new Subject();
subject.subscribe({
  next: v => console.log(`1: ${v}`),
});
subject.subscribe({
  next: v => console.log(`2: ${v}`),
});

const observable = from([1, 2, 3]);
observable.subscribe(subject);
