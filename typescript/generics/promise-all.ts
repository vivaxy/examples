/**
 * @since 2020-03-02 09:27
 * @author vivaxy
 */
type A = 'A';
type B = 'B';
async function asyncA(): Promise<A> {
  return 'A';
};

async function asyncB(): Promise<B> {
  return 'B';
};

async function test() {
  const promiseA: Promise<A> = asyncA();
  const promiseB: Promise<B> = asyncB();

  // @ts-ignore
  const res: [A, B] = await Promise.all([promiseA, promiseB]);
}
