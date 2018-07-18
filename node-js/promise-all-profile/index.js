/**
 * @since 20180718 15:36
 * @author vivaxy
 */

const createPromise = () => {
  return new Promise((resolve) => {
    resolve();
  });
};

const TEST_COUNT = 1e5;
const profile1 = [];

let testCountProfile1 = 0;

function checkDoneProfile1() {
  testCountProfile1++;
  if (testCountProfile1 === TEST_COUNT) {
    let time = 0;
    profile1.forEach((p1) => {
      time += p1.endTime - p1.startTime;
    });
    console.log('profile1', time);
  }
}

for (let i = 0; i < TEST_COUNT; i++) {
  const p1 = {};
  profile1.push(p1);
  p1.startTime = Date.now();
  Promise.all([createPromise(), createPromise()]).then(() => {
    p1.endTime = Date.now();
    checkDoneProfile1();
  });
}

const profile2 = [];
let testCountProfile2 = 0;

function checkDoneProfile2() {
  testCountProfile2++;
  if (testCountProfile2 === TEST_COUNT) {
    let time = 0;
    profile2.forEach((p2) => {
      time += p2.endTime - p2.startTime;
    });
    console.log('profile2', time);
  }
}

for (let i = 0; i < TEST_COUNT; i++) {
  const p2 = {};
  profile2.push(p2);
  p2.startTime = Date.now();
  let resolved = 0;

  function checkDone() {
    resolved++;
    if (resolved === 2) {
      p2.endTime = Date.now();
      checkDoneProfile2();
    }
  }

  createPromise().then(checkDone);
  createPromise().then(checkDone);

}
