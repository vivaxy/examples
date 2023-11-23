/**
 * @since 2023-11-23
 * @author vivaxy
 */
document.getElementById('parse').addEventListener('click', handleClick);

async function handleClick(e) {
  e.target.disabled = true;
  try {
    const errorStack = document.getElementById('input').value;
    const stacks = errorStack.match(/\((?<src>.+?)\)/g);
    const outputDOMList = await Promise.all(
      stacks.map(function (stackLine) {
        return parseStackLine(stackLine.slice(1, -1));
      }),
    );
    document.getElementById('output').replaceChildren(...outputDOMList);
  } catch (e) {
    console.error(e);
  }
  e.target.disabled = false;
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

async function parseStackLine(stackLine) {
  const [src, line, column] = stackLine.split(':');
  const rawSourceMapSrc = src.startsWith('//')
    ? `https:${src}.map`
    : `${src}.map`;
  const resp = await fetch(rawSourceMapSrc);
  const rawSourceMap = await resp.json();

  const consumer = await new sourceMap.SourceMapConsumer(rawSourceMap);

  const originalPosition = consumer.originalPositionFor({
    line: Number(line),
    column: Number(column),
  });

  const name = document.createElement('span');
  name.textContent = originalPosition.name;

  const position = document.createElement('span');
  position.classList.add('position');
  position.textContent = `@${originalPosition.source}:${originalPosition.line}:${originalPosition.column}`;

  const summary = document.createElement('summary');
  summary.appendChild(name);
  summary.appendChild(position);

  const details = document.createElement('details');
  details.appendChild(summary);

  const EXPAND_LINES = 10;
  const sourceFileIndex = rawSourceMap.sources.findIndex(function (
    sourceFileName,
  ) {
    return normalizeFileName(sourceFileName) === originalPosition.source;
  });
  const sourceFileContent = rawSourceMap.sourcesContent[sourceFileIndex];
  const sourceFileContentLines = sourceFileContent.split('\n');

  sourceFileContentLines.forEach(function (sourceFileContentLine, index) {
    const lineNo = index + 1;
    if (
      lineNo >= originalPosition.line - EXPAND_LINES &&
      lineNo <= originalPosition.line + EXPAND_LINES
    ) {
      const lineNoSpan = document.createElement('span');
      lineNoSpan.classList.add('line-no');
      lineNoSpan.textContent = lineNo;

      const contentSpan = document.createElement('span');
      contentSpan.classList.add('content');
      contentSpan.textContent = sourceFileContentLine;

      const p = document.createElement('p');
      p.appendChild(lineNoSpan);
      p.appendChild(contentSpan);
      if (lineNo === originalPosition.line) {
        p.classList.add('current-line');
      }

      details.appendChild(p);
    }
  });

  consumer.destroy();

  return details;
}
