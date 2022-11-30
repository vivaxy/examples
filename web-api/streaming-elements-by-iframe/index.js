/**
 * @since 2022-11-30 16:03
 * @author vivaxy
 * @ref https://jakearchibald.com/2016/fun-hacks-faster-content/
 */
// Create an iframe:
const iframe = document.createElement('iframe');

// Put it in the document (but hidden):
iframe.style.display = 'none';
document.body.appendChild(iframe);

function sleep(timeout) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
}

// Wait for the iframe to be ready:
iframe.onload = async () => {
  // Ignore further load events:
  iframe.onload = null;

  function open() {
    // Write a dummy tag:
    iframe.contentDocument.write('<streaming-element>');

    // Get a reference to that element:
    const streamingElement = iframe.contentDocument.querySelector(
      'streaming-element',
    );

    // Pull it out of the iframe & into the parent document:
    document.body.appendChild(streamingElement);
  }

  function pipe(htmlString) {
    iframe.contentDocument.write(htmlString);
  }

  function end() {
    // Keep writing content like above, and then when we're done:
    iframe.contentDocument.write('</streaming-element>');
    iframe.contentDocument.close();
  }

  open();
  // Write some more content - this should be done async:
  await sleep(1000);
  pipe('<p>Hello!</p>');
  await sleep(1000);
  pipe('<p>World!</p>');

  end();
};

// Initialise the iframe
iframe.src = '';
