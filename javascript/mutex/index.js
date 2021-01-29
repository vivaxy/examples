/**
 * @since 2021-01-29 17:17
 * @author vivaxy
 */
const currentLocks = [];

function getMutex() {
  let resolve = null;
  const promise = new Promise(function (resolveFn) {
    resolve = resolveFn;
  });

  async function lock() {
    currentLocks.push(promise);
    for (let i = 0, l = currentLocks.length - 1; i < l; i++) {
      await currentLocks[i];
    }
  }

  async function unlock() {
    const index = currentLocks.indexOf(promise);
    if (index === -1) {
      throw new Error('mutex not locked');
    }
    for (let i = 0; i < index; i++) {
      await currentLocks[i];
    }
    resolve();
    // how to clear promise stack? use linked list?
  }

  return {
    lock,
    unlock,
  };
}

// testcase
const threadCount = 4;
for (let i = 0; i < threadCount; i++) {
  const mutex = getMutex();
  const label = document.createElement('p');
  label.textContent = `Thread ${i}`;
  const lockButton = document.createElement('button');
  lockButton.textContent = 'lock';
  lockButton.addEventListener('click', async function () {
    console.log(`lock ${i}`);
    await mutex.lock();
    console.log(`perform ${i} task`);
  });
  const unlockButton = document.createElement('button');
  unlockButton.textContent = 'unlock';
  unlockButton.addEventListener('click', async function () {
    await mutex.unlock();
    console.log(`unlocked ${i}`);
  });

  const container = document.createElement('div');
  container.appendChild(label);
  container.appendChild(lockButton);
  container.appendChild(unlockButton);

  document.body.appendChild(container);
}
