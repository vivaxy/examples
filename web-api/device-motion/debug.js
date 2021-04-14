/**
 * @since 20180525 16:45
 * @author vivaxy
 */

function init() {
  const el = document.createElement('div');
  document.body.appendChild(el);

  function LOG(string) {
    el.innerHTML = string;
  }

  window.LOG = LOG;
}

export default { init };
