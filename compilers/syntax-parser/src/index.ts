/**
 * @since 2020-03-04 10:03
 * @author vivaxy
 */
import tokenize, { TokenPattern } from './tokenize';
import parse from './parse';

export default function syntaxParser(
  tokenPatterns: TokenPattern[],
  parseRule: string,
  code: string,
) {
  const tokens = tokenize(tokenPatterns, code);
  const ast = parse(parseRule, tokens);
  return ast;
}
