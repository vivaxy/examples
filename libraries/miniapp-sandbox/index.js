/**
 * @since 2023-08-29
 * @author vivaxy
 */
const APP_RESOURCE_BASE_PATH = './';

function loadJS(appId, handleMessage) {
  return new Promise(function (resolve, reject) {
    const worker = new Worker(`${APP_RESOURCE_BASE_PATH}${appId}/app.js`);
    worker.addEventListener('message', function (e) {
      if (e.data.type === 'load') {
        resolve({
          worker,
          initialData: e.data.data,
        });
      } else {
        handleMessage(e);
      }
    });
  });
}

async function loadTemplate(appId) {
  const response = await fetch(
    `${APP_RESOURCE_BASE_PATH}${appId}/template.ejs`,
  );
  const text = await response.text();
  const renderTemplate = ejs.compile(text);
  return function render(data, templateRoot) {
    // TODO DOM diff match patch
    templateRoot.innerHTML = renderTemplate(data);
  };
}

function createShadowDOMAndLoadStyle(appId) {
  return new Promise(function (resolve, reject) {
    const appRoot = document.querySelector(`[data-app-id="${appId}"]`);
    const shadow = appRoot.attachShadow({ mode: 'closed' });
    const templateRoot = document.createElement('template-root');

    const style = document.createElement('link');
    style.addEventListener('load', function () {
      resolve({
        shadow,
        templateRoot,
      });
    });
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('href', `${APP_RESOURCE_BASE_PATH}${appId}/style.css`);

    shadow.appendChild(style);

    shadow.appendChild(templateRoot);
  });
}

async function loadResources(appId) {
  function handleMessage(e) {
    if (e.data.type === 'data-updated') {
      render(e.data.data, templateRoot);
    }
  }

  const [
    { worker, initialData },
    render,
    { templateRoot },
  ] = await Promise.all([
    loadJS(appId, handleMessage),
    loadTemplate(appId),
    createShadowDOMAndLoadStyle(appId),
  ]);

  templateRoot.addEventListener('click', function (e) {
    const clickHandlerName = e.target.getAttribute('bindclick');
    if (clickHandlerName) {
      worker.postMessage({
        type: 'dispatch-event',
        handlerName: clickHandlerName,
      });
    }
  });

  render(initialData, templateRoot);
  worker.postMessage({
    type: 'onLoad',
  });
}

loadResources('basic-app');
