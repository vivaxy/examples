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
