function localLongTask() {
  console.log('localLongTask start');
  const end = Date.now() + 1000;
  while (Date.now() < end) {}
  console.log('localLongTask end');
}

function remoteLongTask() {
  console.log('remoteLongTask start');
  return new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
    console.log('remoteLongTask end');
  });
}

async function run() {
  await remoteLongTask();
  localLongTask();
  return await run();
}

document.getElementById('run').addEventListener('click', run);
