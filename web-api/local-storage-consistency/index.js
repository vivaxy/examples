/**
 * @since 2024-08-28
 * @author vivaxy
 */
const LOCAL_STORAGE_KEY = 'local-storage-consistency';
const tabId = String(Math.random());

function complexLogic() {
  let sum = 0;
  for (let i = 0; i < 1e8; i++) {
    sum += Math.random();
  }
  return sum;
}

function checkConsistency() {
  localStorage.setItem(LOCAL_STORAGE_KEY, tabId);
  complexLogic();
  return localStorage.getItem(LOCAL_STORAGE_KEY) === tabId;
}

const NOTIFY_LOCAL_STORAGE_KEY = 'local-storage-consistency-notify';
window.addEventListener('storage', (e) => {
  if (
    e.storageArea === localStorage &&
    e.key === NOTIFY_LOCAL_STORAGE_KEY &&
    !e.newValue.startsWith(tabId)
  ) {
    console.log('consistency', checkConsistency());
  }
});

document
  .getElementById('check-consistency')
  .addEventListener('click', function () {
    localStorage.setItem(NOTIFY_LOCAL_STORAGE_KEY, `${tabId}-${Date.now()}`);
  });
