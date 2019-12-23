/**
 * @since 2019-12-23 11:13
 * @author vivaxy
 */
function createPromise() {
  return new Promise(function() {});
}

(async function() {
  try {
    await createPromise();
    console.log('done');
  } catch (error) {
    console.error(error);
  }
})();
