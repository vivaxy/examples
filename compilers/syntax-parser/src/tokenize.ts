/**
 * @since 2020-02-26 02:39
 * @author vivaxy
 */
interface Pattern {
  type: string;
  regExps: RegExp[];
  ignore?: boolean;
}

function getMatched(patterns: Pattern[], code: string) {
  for (const pattern of patterns) {
    for (const regExp of pattern.regExps) {
      const formattedRegExp = new RegExp(`^(${regExp.source})`);
      const matched = code.match(formattedRegExp);
      if (matched) {
        return {
          type: pattern.type,
          regExp: regExp,
          ignore: pattern.ignore,
          value: matched[1],
        };
      }
    }
  }
  return null;
}

function getPosition(code: string, lineNumber: number, columnNumber: number) {
  const lines = code.split(/\r\n|\r|\n/);
  const newLineCount = lines.length;

  return {
    newLineNumber: lineNumber + newLineCount - 1,
    newColumnNumber: getNewColumnNumber(lines, columnNumber),
  };
}

function getNewColumnNumber(lines: string[], columnNumber: number) {
  if (lines.length > 1) {
    return lines[lines.length - 1].length;
  }
  return columnNumber + lines[0].length;
}

export default function tokenize(patterns: Pattern[], code: string) {
  let index = 0;
  let lineNumber = 0;
  let columnNumber = 0;
  const tokens = [];
  while (index < code.length) {
    const matched = getMatched(patterns, code.slice(index));
    if (!matched) {
      throw new Error(`Unexpected token (${lineNumber}:${columnNumber})`);
    }

    // get position
    const { newLineNumber, newColumnNumber } = getPosition(
      matched.value,
      lineNumber,
      columnNumber,
    );

    // push token
    if (!matched.ignore) {
      tokens.push({
        type: matched.type,
        value: matched.value,
        position: [lineNumber, columnNumber, newLineNumber, newColumnNumber],
      });
    }

    index += matched.value.length;
    lineNumber = newLineNumber;
    columnNumber = newColumnNumber;
  }
  return tokens;
}
