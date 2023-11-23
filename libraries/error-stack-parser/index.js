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
      stacks.map(async function (stackLine) {
        const info = await parseStackLine(stackLine.slice(1, -1));
        return renderStackLine(info);
      }),
    );
    document
      .getElementById('output')
      .replaceChildren(...outputDOMList.filter((x) => !!x));
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

function renderStackLine(stackLine) {
  const name = document.createElement('span');
  name.textContent = stackLine.name;

  const position = document.createElement('span');
  position.classList.add('position');
  position.textContent = `@${stackLine.source}:${stackLine.line}:${stackLine.column}`;

  const summary = document.createElement('summary');
  summary.appendChild(name);
  summary.appendChild(position);

  const details = document.createElement('details');
  details.appendChild(summary);

  stackLine.details.forEach(function ({ lineNo, sourceFileContentLine }) {
    const lineNoSpan = document.createElement('span');
    lineNoSpan.classList.add('line-no');
    lineNoSpan.textContent = lineNo;

    const contentSpan = document.createElement('span');
    contentSpan.classList.add('content');
    contentSpan.textContent = sourceFileContentLine;

    const p = document.createElement('p');
    p.appendChild(lineNoSpan);
    p.appendChild(contentSpan);
    if (lineNo === stackLine.line) {
      p.classList.add('current-line');
    }

    details.appendChild(p);
  });

  return details;
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

  const EXPAND_LINES = 10;
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
      lineNo >= originalPosition.line - EXPAND_LINES &&
      lineNo <= originalPosition.line + EXPAND_LINES
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
