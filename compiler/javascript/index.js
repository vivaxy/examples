/**
 * @since 20180503 11:40
 * @author vivaxy
 */

const tokenTypes = {
  ARITHMETIC_OPERATOR: 'arithmeticOperator', // +(二元), -(二元), /, *, %, **, ++, --, -(一元), +(一元)
  BITWISE_OPERATOR: 'bitwiseOperator', // &, |, ^, ~, <<, >>, >>>
  COMPARISON_OPERATOR: 'comparisonOperator', // ==, ===, >, <, <=, >=, !=, !==
  CONDITIONAL_OPERATOR: 'conditionalOperator', // ? :
  LOGICAL_OPERATOR: 'logicalOperator', // &&, ||, !
  ARGUMENT: 'argument',
  NUMBER: 'number',
  STRING: 'string',
  PARENTHESIS: 'parenthesis',
};

compiler.tokenTypes = tokenTypes;

function tokenizer(input) {
  let tokens = [];
  let i = 0;
  const length = input.length;
  while (i < length) {
    let char = input[i];
    if (char === ' ') {
      i++;
      continue;
    }
    if (char === '*' || char === '+' || char === '-') {
      const nextChar = char[i + 1];
      if (char === nextChar) {
        tokens.push({ type: tokenTypes.ARITHMETIC_OPERATOR, value: char + char });
        i += 2;
        continue;
      }
      tokens.push({ type: tokenTypes.ARITHMETIC_OPERATOR, value: char });
      i++;
      continue;
    }
    if (char === '/' || char === '%') {
      tokens.push({ type: tokenTypes.ARITHMETIC_OPERATOR, value: char });
      i++;
      continue;
    }
    if (char === '&' || char === '|') {
      const nextChar = input[i + 1];
      if (char === nextChar) {
        tokens.push({ type: tokenTypes.LOGICAL_OPERATOR, value: char + char });
        i += 2;
        continue;
      }
      tokens.push({ type: tokenTypes.BITWISE_OPERATOR, value: char });
      i++;
      continue;
    }
    if (char === '^' || char === '~') {
      tokens.push({ type: tokenTypes.BITWISE_OPERATOR, value: char });
      i++;
      continue;
    }
    if (char === '<') {
      const nextChar = input[i + 1];
      if (nextChar === '<') {
        tokens.push({ type: tokenTypes.BITWISE_OPERATOR, value: '<<' });
        i += 2;
        continue;
      }
      if (nextChar === '=') {
        tokens.push({ type: tokenTypes.COMPARISON_OPERATOR, value: '<=' });
        i += 2;
        continue;
      }
      tokens.push({ type: tokenTypes.COMPARISON_OPERATOR, value: char });
      i++;
      continue;
    }
    if (char === '>') {
      const nextChar = input[i + 1];
      if (nextChar === '>') {
        if (input[i + 2] === '>') {
          tokens.push({ type: tokenTypes.BITWISE_OPERATOR, value: '>>>' });
          i += 3;
          continue;
        }
        tokens.push({ type: tokenTypes.BITWISE_OPERATOR, value: '>>' });
        i += 2;
        continue;
      }
      if (nextChar === '=') {
        tokens.push({ type: tokenTypes.COMPARISON_OPERATOR, value: '>=' });
        i += 2;
        continue;
      }
      tokens.push({ type: tokenTypes.COMPARISON_OPERATOR, value: char });
      i++;
      continue;
    }
    if (char === '=') {
      const nextChar = input[i + 1];
      if (nextChar === '=') {
        if (input[i + 2] === '=') {
          tokens.push({ type: tokenTypes.COMPARISON_OPERATOR, value: '===' });
          i += 3;
          continue;
        }
        tokens.push({ type: tokenTypes.COMPARISON_OPERATOR, value: '==' });
        i += 2;
        continue;
      }
      tokens.push({ type: tokenTypes.COMPARISON_OPERATOR, value: char });
      i++;
      continue;
    }
    if (char === '!') {
      const nextChar = input[i + 1];
      if (nextChar === '=') {
        if (input[i + 2] === '=') {
          tokens.push({ type: tokenTypes.COMPARISON_OPERATOR, value: '!==' });
          i += 3;
          continue;
        }
        tokens.push({ type: tokenTypes.COMPARISON_OPERATOR, value: '!=' });
        i += 2;
        continue;
      }
      tokens.push({ type: tokenTypes.LOGICAL_OPERATOR, value: char });
      i++;
      continue;
    }
    if (char === '?' || char === ':') {
      tokens.push({ type: tokenTypes.CONDITIONAL_OPERATOR, value: char });
      i++;
      continue;
    }
    if (char === '{') {
      if (input[i + 1] === '{') {
        i += 2;
        char = input[i];
        let argumentName = '';
        while (i < length && char !== '}') {
          argumentName += char;
          i++;
          char = input[i];
        }
        i++;
        if (input[i] === '}') {
          if (argumentName !== '') {
            tokens.push({ type: tokenTypes.ARGUMENT, value: argumentName });
            i++;
            continue;
          }
        }
      }
    }
    const NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let value = '';
      while (NUMBERS.test(char)) {
        value += char;
        char = input[++i];
      }
      tokens.push({ type: tokenTypes.NUMBER, value });
      continue;
    }
    if (char === '"') {
      let value = '';
      char = input[++i];
      while (char !== '"') {
        value += char;
        char = input[++i];
      }
      char = input[++i];
      tokens.push({ type: tokenTypes.STRING, value });
      continue;
    }
    if (char === '\'') {
      let value = '';
      char = input[++i];
      while (char !== '\'') {
        value += char;
        char = input[++i];
      }
      char = input[++i];
      tokens.push({ type: tokenTypes.STRING, value });
      continue;
    }
    if (char === ')' || char === ')') {
      tokens.push({ type: tokenTypes.PARENTHESIS, value });
      i++;
      continue;
    }
    throw new Error('Unexpected token: ' + char);
  }
  return tokens;
}
compiler.tokenizer = tokenizer;

function parser(input) {
  return input;
}
compiler.parser = parser;

function transformer(input) {
  return input;
}
compiler.transformer = transformer;

function codeGenerator(input) {
  return input;
}
compiler.codeGenerator = codeGenerator;

function compiler(input) {
  let tokens = tokenizer(input);
  // console.log(tokens);

  let ast = parser(tokens);
  // console.log(JSON.stringify(ast, null, 2));

  let newAst = transformer(ast);
  // console.log(JSON.stringify(newAst, null, 2));

  let output = codeGenerator(newAst);
  // console.log(output);

  return output;
}

module.exports = compiler;
