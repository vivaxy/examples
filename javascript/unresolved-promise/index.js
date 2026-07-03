function createPromise() {
  return new Promise(function () {});
}

(async function () {
  try {
    await createPromise();
    console.log('done');
  } catch (error) {
    console.error(error);
  }
})();
