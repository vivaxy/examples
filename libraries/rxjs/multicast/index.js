const {
  from,
  Subject,
  operators: { multicast },
} = rxjs;

const source = from([1, 2, 3]);
const subject = new Subject();
const mulicasted = source.pipe(multicast(subject));

mulicasted.subscribe({
  next: (x) => console.log(`1: ${x}`),
});
mulicasted.subscribe({
  next: (x) => console.log(`2: ${x}`),
});

mulicasted.connect();
