/**
 * @since 20180607 10:46
 * @author vivaxy
 */

function functionalRunner() {
  let cachedFns = [];

  function creator() {
    return {
      map(fn) {
        cachedFns.push({ type: 'map', apply: fn });
        return creator();
      },
      filter(fn) {
        cachedFns.push({ type: 'filter', apply: fn });
        return creator();
      },
      call(arr) {
        for (let i = 0; i < arr.length; i++) {
          let value = arr[i];
          for (let j = 0; j < cachedFns.length; j++) {
            const cachedFn = cachedFns[j];
            if (cachedFn.type === 'map') {
              value = cachedFn.apply(value);
            } else if (cachedFn.type === 'filter') {
              if (!cachedFn.apply(value)) {
                break;
              }
            }
          }
        }
      },
    };
  }

  return creator();
}

const array = [1, 2, 3];

functionalRunner().map(x => x * 2).filter(x => x !== 4).map(console.log).call(array);
