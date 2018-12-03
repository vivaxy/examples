/**
 * @since 2018-12-03 17:10
 * @author vivaxy
 */

const { Observable } = rxjs;

const foo = Observable.create(function(observer) {
  console.log('Hello');
  observer.next(42);
  observer.next(43);
  console.log('World');
  observer.next(44);
  setTimeout(() => {
    observer.next(45);
    observer.error('My Error');
  }, 1000);
});

foo.subscribe(function(x) {
  console.log(x);
});

console.log('After');
