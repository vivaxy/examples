

function parseRules(rule: string) {
  return rule
  .split(';')
  .map(function(v) {
    return v.trim();
  })
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
}

function match() {

}

export function tokenize(stateMachine: StateMachine, code: string) {
  let i = 0;
  while (i < code.length){
    const char = code[i];
    const handler = patterns[state][char];
    if (handler){
      if (handler.state){
        state = handler.nextState;
      }
      if (handler.next){
        i++;
      }
    }
  }
}

export function parser(rule: string, code: string) {
  const rules = parseRules(rule);

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
        } else if (match.startsWith('/') && match.endsWith('/')) {
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

}
