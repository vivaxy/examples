export default function traverse(rule: string, code: string) {
  const rules = rule
    .split('\n')
    .filter(Boolean)
    .map(function(ruleLine) {
      const [type, target] = ruleLine.split('::=').map(function(v) {
        return v.trim();
      });
      const options = target.split('|').map(function(v) {
        return v
          .trim()
          .split(' ')
          .filter(Boolean);
      });
      return { type, options };
    });
  for (const { type, options } of rules) {
    for (const option of options) {
      let ok = true;
      let matched = [];
      for (const match of option) {
        if (
          (match.startsWith("'") && match.endsWith("'")) ||
          (match.startsWith('"') && match.endsWith(':'))
        ) {
          const token = match.slice(1, -1);
          if (token !== code) {
            ok = false;
            break;
          }
          matched.push(token);
        }
      }
      if (ok) {
        return {
          type,
          value: matched,
        };
      }
    }
  }
  return null;
}
