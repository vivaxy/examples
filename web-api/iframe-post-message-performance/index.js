/**
 * @since 2022-12-05 16:57
 * @author vivaxy
 */
const buttons = document
  .querySelectorAll('[data-button]')
  .forEach(function (button) {
    const { type } = button.dataset;
    const iframe = document.querySelector(`[data-iframe][data-type="${type}"]`);
    button.addEventListener('click', async function () {
      const dataLength = Number(document.getElementById('data').value);
      const data = 'x'.repeat(dataLength - 28);
      const times = 1e4;
      const startTime = performance.now();
      for (let i = 0; i < times; i++) {
        await request(iframe, data);
      }
      const endTime = performance.now();
      console.log(
        `Send about ${
          JSON.stringify({
            type: 'request',
            data,
          }).length
        } bytes message, Run ${times}, each time with ${
          (endTime - startTime) / times
        }ms`,
      );
    });
  });

function request(iframe, data) {
  return new Promise(function (resolve) {
    iframe.contentWindow.postMessage(
      {
        type: 'request',
        data,
      },
      '*',
    );
    window.addEventListener(
      'message',
      (e) => {
        if (e.data.type === 'response') {
          resolve();
        }
      },
      { once: true },
    );
  });
}
