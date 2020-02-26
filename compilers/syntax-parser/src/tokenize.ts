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
  throw new Error('Unexpected token');
}

export default function tokenize(patterns: Pattern[], code: string) {
  let index = 0;
  const tokens = [];
  while (index < code.length) {
    const matched = getMatched(patterns, code.slice(index));
    if (matched.ignore) {
      index += matched.value.length;
    } else {
      tokens.push({
        type: matched.type,
        value: matched.value,
        position: [index, (index += matched.value.length)],
      });
    }
  }
  return tokens;
}
