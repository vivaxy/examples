/**
 * @since 2018-12-03 19:36
 * @author vivaxy
 */

const { interval } = rxjs;

const observable1 = interval(400);
const observable2 = interval(300);
const subscription1 = observable1.subscribe((x) => console.log(`1: ${x}`));
const subscription2 = observable2.subscribe((x) => console.log(`2: ${x}`));

subscription1.add(subscription2);
setTimeout(() => {
  subscription1.unsubscribe();
}, 1000);
