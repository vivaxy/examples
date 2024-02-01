/**
 * @since 2023-11-23
 * @author vivaxy
 */
const cache = new Map();
const $parseButton = document.getElementById('parse');
const $output = document.getElementById('output');
const $input = document.getElementById('input');
const $paddingLines = document.getElementById('padding-lines');

const url = new URL(location.href);
const query = {
  paddingLines: Number(url.searchParams.get('paddingLines')) || 20,
  stacks: url.searchParams.get('stacks'),
  stackIndex: Number(url.searchParams.get('stackIndex')),
  lineNo: Number(url.searchParams.get('lineNo')),
};

$parseButton.addEventListener('click', handleClick);
$paddingLines.addEventListener('change', function () {
  const paddingLines = Number($paddingLines.value);
  if (!isNaN(paddingLines)) {
    query.paddingLines = paddingLines;
  }
});

if (query.stacks) {
  $input.value = query.stacks;
  handleClick();
} else {
  $parseButton.disabled = false;
}
if (query.paddingLines !== Number($paddingLines.value)) {
  $paddingLines.value = query.paddingLines;
}

async function handleClick() {
  $parseButton.disabled = true;
  $output.innerHTML = 'Loading...';
  try {
    const errorStack = $input.value;
    const stacks = errorStack.match(/ at (?<name>.+?) \((?<src>.+?)\)/g);
    if (!stacks) {
      throw new Error('Invalid error stacks');
    }
    const outputDOMList = await Promise.all(
      stacks.map(async function (stackLine, stackIndex) {
        const match = stackLine.match(/ at (?<name>.+?) \((?<src>.+?)\)/);
        if (!match) {
          return null;
        }
        const { name, src } = match.groups;
        const info =
          src === '<anonymous>'
            ? {
                name,
                source: src,
                line: '',
                column: '',
                details: [],
              }
            : await parseStackLine(src);
        if (info.name === null) {
          info.name = name;
        }
        return renderStackLine(info, stackIndex);
      }),
    );
    $output.replaceChildren(...outputDOMList.filter((x) => !!x));
    if (query.stackIndex) {
      outputDOMList[query.stackIndex].scrollIntoView({ behavior: 'smooth' });
    }
  } catch (e) {
    console.error(e);
  }
  $parseButton.disabled = false;
}

function normalizeArray(parts, allowAboveRoot) {
  const res = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];

    // ignore empty parts
    if (!p || p === '.') continue;

    if (p === '..') {
      if (res.length && res[res.length - 1] !== '..') {
        res.pop();
      } else if (allowAboveRoot) {
        res.push('..');
      }
    } else {
      res.push(p);
    }
  }

  return res;
}

const pathModule = {
  isAbsolute(path) {
    return path.charAt(0) === '/';
  },
  normalize(path) {
    const isAbsolute = pathModule.isAbsolute(path);
    const trailingSlash = path && path[path.length - 1] === '/';

    path = normalizeArray(path.split('/'), !isAbsolute).join('/');

    if (!path && !isAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }

    return (isAbsolute ? '/' : '') + path;
  },
};

function normalizeFileName(fileName) {
  const [protocol, path] = fileName.split('://');
  return `${protocol}://${pathModule.normalize(path)}`;
}

function renderStackLine(stackLine, stackIndex) {
  const name = document.createElement('span');
  name.textContent = stackLine.name;

  const position = document.createElement('span');
  position.classList.add('position');
  position.textContent = `@${stackLine.source}:${stackLine.line}:${stackLine.column}`;

  const summary = document.createElement('summary');
  summary.appendChild(name);
  summary.appendChild(position);

  const details = document.createElement('details');
  details.open = stackIndex === query.stackIndex;
  details.appendChild(summary);

  stackLine.details.forEach(function ({ lineNo, sourceFileContentLine }) {
    const contentSpan = document.createElement('span');
    contentSpan.classList.add('content');
    contentSpan.textContent = sourceFileContentLine;

    const p = document.createElement('p');

    const lineNoSpan = document.createElement('span');
    lineNoSpan.classList.add('line-no');
    lineNoSpan.textContent = lineNo;
    lineNoSpan.addEventListener('click', function () {
      query.stacks = $input.value;
      query.stackIndex = stackIndex;
      query.lineNo = lineNo;

      $output
        .querySelector('.highlight-line')
        .classList.remove('highlight-line');
      p.classList.add('highlight-line');

      const url = new URL(location.href);
      url.searchParams.set('paddingLines', query.paddingLines);
      url.searchParams.set('stacks', query.stacks);
      url.searchParams.set('stackIndex', query.stackIndex);
      url.searchParams.set('lineNo', query.lineNo);
      window.history.replaceState(null, '', url.href);
    });

    p.appendChild(lineNoSpan);
    p.appendChild(contentSpan);
    if (lineNo === stackLine.line) {
      p.classList.add('current-line');
    }
    if (stackIndex === query.stackIndex && lineNo === query.lineNo) {
      p.classList.add('highlight-line');
    }

    details.appendChild(p);
  });

  return details;
}

async function fetchWithCache(sourceMapSrc) {
  if (cache.has(sourceMapSrc)) {
    return cache.get(sourceMapSrc);
  }
  const resp = await fetch(sourceMapSrc);
  const rawSourceMap = await resp.json();
  cache.set(sourceMapSrc, rawSourceMap);
  return rawSourceMap;
}

async function parseStackLine(stackLine) {
  const [src, line, column] = stackLine.split(':');
  const rawSourceMapSrc = src.startsWith('//')
    ? `https:${src}.map`
    : `${src}.map`;

  const rawSourceMap = await fetchWithCache(rawSourceMapSrc);
  const consumer = await new sourceMap.SourceMapConsumer(rawSourceMap);

  const originalPosition = consumer.originalPositionFor({
    line: Number(line),
    column: Number(column),
  });
  consumer.destroy();

  if (!originalPosition.source) {
    return {
      name: null,
      source: src,
      line,
      column,
      details: [],
    };
  }

  const sourceFileIndex = rawSourceMap.sources.findIndex(function (
    sourceFileName,
  ) {
    return normalizeFileName(sourceFileName) === originalPosition.source;
  });
  const sourceFileContent = rawSourceMap.sourcesContent[sourceFileIndex];
  const sourceFileContentLines = sourceFileContent.split('\n');

  const details = [];
  sourceFileContentLines.forEach(function (sourceFileContentLine, index) {
    const lineNo = index + 1;
    if (
      lineNo >= originalPosition.line - query.paddingLines &&
      lineNo <= originalPosition.line + query.paddingLines
    ) {
      details.push({
        lineNo,
        sourceFileContentLine,
      });
    }
  });

  return {
    name: originalPosition.name,
    source: originalPosition.source,
    line: originalPosition.line,
    column: originalPosition.column,
    details,
  };
}
