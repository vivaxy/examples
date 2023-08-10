/**
 * @since 2023-08-07
 * @author vivaxy
 */
let heartbeatTimer = null;
const iframe = document.querySelector('iframe');

function clearHeartbeatTimer() {
  clearTimeout(heartbeatTimer);
}

function startHeartbeatTimer() {
  clearHeartbeatTimer();
  heartbeatTimer = setTimeout(() => {
    console.log('timeout for 10s');
  }, 10e3);
}

window.addEventListener('message', function (e) {
  if (e.source === iframe.contentWindow && e.data.source === 'vivaxy-iframe') {
    console.log('receive heartbeat');
    startHeartbeatTimer();
  }
});

iframe.addEventListener('load', function () {
  startHeartbeatTimer();
});

// patch for the frozen state
// not applicable in Safari、Firefox
document.addEventListener('frozen', function () {
  clearHeartbeatTimer();
});

document.addEventListener('resume', function () {
  startHeartbeatTimer();
});
