/**
 * @since 2019-02-02 10:56
 * @author vivaxy
 */

const reportActions = {
  sendSyncXHR() {
    const xhr = new XMLHttpRequest();
    xhr.open('get', 'index.js', false);
    xhr.send();
  },
};

Array.from(document.querySelectorAll('button')).forEach((button) => {
  button.addEventListener('click', reportActions[button.id]);
});

const observer = new ReportingObserver((reports, observer) => {
  for (const report of reports) {
    console.log('report: ', report);
  }
}, { buffered: true });

observer.observe();
