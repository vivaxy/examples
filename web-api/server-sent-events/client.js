/**
 * @since 2023-03-28
 * @author vivaxy
 */
const evtSource = new EventSource('/server');

evtSource.addEventListener('message', function (e) {
  console.log('message', e);
  if (e.data === 'close') {
    console.log('client close');
    evtSource.close();
  }
});

evtSource.addEventListener('error', function (e) {
  console.log('error', e);
});

evtSource.addEventListener('my-event', function (e) {
  console.log('my-event', e);
});
