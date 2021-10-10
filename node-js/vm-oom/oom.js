/**
 * @since 2021-10-09
 * @author vivaxy
 */
let times = 0;

function run() {
  let str = 'var a = "';
  for (let i = 0; i < (100 * 1024) / 18; i++) str += Math.random().toString();
  str += '";';

  const script = new (require('vm').Script)(str);
  times++;
  if (times === 330) {
    require('v8').writeHeapSnapshot(
      require('path').join(__dirname, 'temp.heapsnapshot'),
    );
  }
  if (times % 1000 === 0) console.log(times);
}

(async () => {
  while (true) {
    run();

    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });

    gc();
  }
})();
