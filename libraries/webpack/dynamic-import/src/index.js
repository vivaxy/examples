setTimeout(async function () {
  const result = await import('./dynamic-module');
  console.log(result);
}, 10);
