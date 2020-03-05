/**
 * @since 2020-02-27 03:55
 * @author vivaxy
 */
import { Token } from './tokenize';
import { Rule } from './parse-rule';

export default function parse(rule: Rule, tokens: Token[]) {
  for (const token of tokens) {
    if (rule.takeToken(token)) {
      continue;
    } else {
      return false;
    }
  }
  return true;
}
