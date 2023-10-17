/**
 * @since 2023-10-17
 * @author vivaxy
 */
const url = new URL(location.href);
const version = url.searchParams.get('version') || 'latest';
const content = url.searchParams.get('content') || 'a \\ne b';

const $version = document.getElementById('version');
const $content = document.getElementById('content');
const $container = document.getElementById('container');

$version.value = version;
$content.value = content;

function loadScript(src) {
  return new Promise(function (resolve, reject) {
    const script = document.createElement('script');
    script.addEventListener('load', resolve);
    script.addEventListener('error', reject);
    script.src = src;
    document.body.appendChild(script);
  });
}

function loadStyle(src) {
  return new Promise(function (resolve, reject) {
    const link = document.createElement('link');
    link.addEventListener('load', resolve);
    link.addEventListener('error', reject);
    link.rel = 'stylesheet';
    link.href = src;
    document.head.appendChild(link);
  });
}

async function loadResource(version) {
  const script = `https://cdn.jsdelivr.net/npm/katex@${version}/dist/katex.js`;
  const style = `https://cdn.jsdelivr.net/npm/katex@${version}/dist/katex.css`;
  await Promise.all([loadScript(script), loadStyle(style)]);
}

function renderContent(content) {
  const html = window.katex.renderToString(content);
  $container.innerHTML = html;
}

$version.addEventListener('change', main);

$content.addEventListener('change', function (e) {
  renderContent(e.target.value);
});

async function main() {
  await loadResource($version.value);
  renderContent($content.value);
}

main();
