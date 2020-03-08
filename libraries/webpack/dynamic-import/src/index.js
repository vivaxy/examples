/**
 * @since 2020-03-08 08:03
 * @author vivaxy
 */
setTimeout(async function () {
  const result = await import('./dynamic-module');
  console.log(result);
}, 10);
