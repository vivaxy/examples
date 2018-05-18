/**
 * @since 20180503 11:40
 * @author vivaxy
 */

const tokenTypes = {
  ARITHMETIC_OPERATOR: 'arithmeticOperator', // +(二元), -(二元), /, *, %, **, ++, --, -(一元), +(一元)
  // BITWISE_OPERATOR: 'bitwiseOperator', // &, |, ^, ~, <<, >>, >>>
  COMPARISON_OPERATOR: 'comparisonOperator', // ==, ===, >, <, <=, >=, !=, !==
  CONDITIONAL_OPERATOR: 'conditionalOperator', // ? :
  LOGICAL_OPERATOR: 'logicalOperator', // &&, ||, !
  ARGUMENT: 'argument',
  NUMBER: 'number',
  STRING: 'string',
  BOOLEAN: 'boolean',
  PARENTHESIS: 'parenthesis',
  LABEL: 'label', // ;
  NULL: 'null',
  IDENTIFIER: 'identifier', // 变量 / undefined
};

compiler.tokenTypes = tokenTypes;

const astTypes = {
  PROGRAM: 'Program',
  EXPRESSION_STATEMENT: 'ExpressionStatement',
  LITERAL: 'Literal',
  BINARY_EXPRESSION: 'BinaryExpression',
  UNARY_EXPRESSION: 'UnaryExpression',
  LOGICAL_EXPRESSION: 'LogicalExpression',
  IDENTIFIER: 'Identifier',
};

compiler.astTypes = astTypes;

const astFactory = {
  PROGRAM: (body) => {
    return { type: astTypes.PROGRAM, body };
  },
  EXPRESSION_STATEMENT: (expression) => {
    return { type: astTypes.EXPRESSION_STATEMENT, expression };
  },
  LITERAL: (value) => {
    return { type: astTypes.LITERAL, value };
  },
  BINARY_EXPRESSION: (operator, left, right) => {
    return { type: astTypes.BINARY_EXPRESSION, operator, left, right };
  },
  UNARY_EXPRESSION: (operator, argument) => {
    return { type: astTypes.UNARY_EXPRESSION, operator, argument };
  },
  LOGICAL_EXPRESSION: (operator, left, right) => {
    return { type: astTypes.LOGICAL_EXPRESSION, operator, left, right };
  },
  IDENTIFIER: (name) => {
    return { type: astTypes.IDENTIFIER, name };
  },
};

compiler.astFactory = astFactory;

function tokenizer(input) {
  let tokens = [];
  let i = 0;
  const length = input.length;

  function pushToken(type, value, extraLength = 0) {
    i += value.length + extraLength;
    if (type === tokenTypes.NUMBER) {
      value = Number(value);
    }
    if (type === tokenTypes.BOOLEAN) {
      value = value === 'true';
    }
    if (type === tokenTypes.NULL) {
      value = null;
    }
    tokens.push({
      type,
      value,
    });
  }

  while (i < length) {
    let char = input[i];
    if (char === ' ') {
      i++;
      continue;
    }
    if (char === ';') {
      pushToken(tokenTypes.LABEL, char);
      continue;
    }
    if (char === '*' || char === '+' || char === '-') {
      const nextChar = char[i + 1];
      if (char === nextChar) {
        pushToken(tokenTypes.ARITHMETIC_OPERATOR, char + char);
        continue;
      }
      pushToken(tokenTypes.ARITHMETIC_OPERATOR, char);
      continue;
    }
    if (char === '/' || char === '%') {
      pushToken(tokenTypes.ARITHMETIC_OPERATOR, char);
      continue;
    }
    if (char === '&' || char === '|') {
      const nextChar = input[i + 1];
      if (char === nextChar) {
        pushToken(tokenTypes.LOGICAL_OPERATOR, char + char);
        continue;
      }
    }
    if (char === '<') {
      const nextChar = input[i + 1];
      if (nextChar === '=') {
        pushToken(tokenTypes.COMPARISON_OPERATOR, '<=');
        continue;
      }
      pushToken(tokenTypes.COMPARISON_OPERATOR, char);
      continue;
    }
    if (char === '>') {
      const nextChar = input[i + 1];
      if (nextChar === '=') {
        pushToken(tokenTypes.COMPARISON_OPERATOR, '>=');
        continue;
      }
      pushToken(tokenTypes.COMPARISON_OPERATOR, char);
      continue;
    }
    if (char === '=') {
      const nextChar = input[i + 1];
      if (nextChar === '=') {
        if (input[i + 2] === '=') {
          pushToken(tokenTypes.COMPARISON_OPERATOR, '===');
          continue;
        }
        pushToken(tokenTypes.COMPARISON_OPERATOR, '==');
        continue;
      }
      pushToken(tokenTypes.COMPARISON_OPERATOR, char);
      continue;
    }
    if (char === '!') {
      const nextChar = input[i + 1];
      if (nextChar === '=') {
        if (input[i + 2] === '=') {
          pushToken(tokenTypes.COMPARISON_OPERATOR, '!==');
          continue;
        }
        pushToken(tokenTypes.COMPARISON_OPERATOR, '!=');
        continue;
      }
      pushToken(tokenTypes.LOGICAL_OPERATOR, char);
      continue;
    }
    if (char === '?' || char === ':') {
      pushToken(tokenTypes.CONDITIONAL_OPERATOR, char);
      continue;
    }
    if (char === '{') {
      if (input[i + 1] === '{') {
        let j = 2;
        char = input[i + j];
        let value = '';
        while (i < length && char !== '}') {
          value += char;
          j++;
          char = input[i + j];
        }
        if (input[i + j + 1] === '}') {
          if (value !== '') {
            pushToken(tokenTypes.ARGUMENT, value, 4);
            continue;
          }
        }
      }
    }
    const NUMBERS = /[0-9]/;
    if (NUMBERS.test(char) || char === '.') {
      let value = '';
      let j = 0;
      while (NUMBERS.test(char) || char === '.') {
        value += char;
        j++;
        char = input[i + j];
      }
      pushToken(tokenTypes.NUMBER, value);
      continue;
    }
    if (char === '"') {
      let value = '';
      let j = 1;
      char = input[i + j];
      while (char !== '"') {
        value += char;
        j++;
        char = input[i + j];
      }
      pushToken(tokenTypes.STRING, value, 2);
      continue;
    }
    if (char === '\'') {
      let value = '';
      let j = 1;
      char = input[i + j];
      while (char !== '\'') {
        value += char;
        j++;
        char = input[i + j];
      }
      pushToken(tokenTypes.STRING, value, 2);
      continue;
    }
    if (char === '(' || char === ')') {
      pushToken(tokenTypes.PARENTHESIS, char);
      continue;
    }
    if (char === 't' && input[i + 1] === 'r' && input[i + 2] === 'u' && input[i + 3] === 'e') {
      pushToken(tokenTypes.BOOLEAN, 'true');
      continue;
    }
    if (char === 'f' && input[i + 1] === 'a' && input[i + 2] === 'l' && input[i + 3] === 's' && input[i + 4] === 'e') {
      pushToken(tokenTypes.BOOLEAN, 'false');
      continue;
    }
    if (char === 'n' && input[i + 1] === 'u' && input[i + 2] === 'l' && input[i + 3] === 'l') {
      pushToken(tokenTypes.NULL, 'null');
      continue;
    }
    if (char === 'u' && input[i + 1] === 'n' && input[i + 2] === 'd' && input[i + 3] === 'e' && input[i + 4] === 'f' && input[i + 5] === 'i' && input[i + 6] === 'n' && input[i + 7] === 'e' && input[i + 8] === 'd') {
      pushToken(tokenTypes.IDENTIFIER, 'undefined');
      continue;
    }
    throw new Error('Unexpected token: ' + char);
  }
  return tokens;
}

compiler.tokenizer = tokenizer;

function parser(tokens, args) {
  let length = tokens.length;

  function getLogicalExpressionIndex(start, end) {
    for (let i = end; i >= start; i--) {
      if (
        tokens[i].type === tokenTypes.LOGICAL_OPERATOR
        && (
          tokens[i].value === '&&'
          || tokens[i].value === '||'
        )
      ) {
        return i;
      }
    }
    return -1;
  }

  function getBinaryExpressionIndex(start, end) {
    for (let i = end; i >= start; i--) {
      if (
        (
          tokens[i].type === tokenTypes.ARITHMETIC_OPERATOR
          && tokens[i - 1]
          && (
            tokens[i - 1].type === tokenTypes.NUMBER
            || tokens[i - 1].type === tokenTypes.STRING
            || tokens[i - 1].type === tokenTypes.BOOLEAN
          )
        ) || (
          tokens[i].type === tokenTypes.COMPARISON_OPERATOR
        )
      ) {
        return i;
      }
    }
    return -1;
  }

  function getUnaryExpression(start, end) {
    if (end - start !== 1) {
      return null;
    }
    if (
      (tokens[start].type === tokenTypes.ARITHMETIC_OPERATOR && tokens[start].value === '-') ||
      (tokens[start].type === tokenTypes.ARITHMETIC_OPERATOR && tokens[start].value === '+') ||
      (tokens[start].type === tokenTypes.ARITHMETIC_OPERATOR && tokens[start].value === '!')
    ) {
      return astFactory.UNARY_EXPRESSION(tokens[start].value, getLiteralOrIdentifier(end, end));
    }
  }

  function getLiteralOrIdentifier(start, end) {
    if (start !== end) {
      return null;
    }
    maskArguments(start, end);
    const token = tokens[start];
    if (token.type === tokenTypes.IDENTIFIER) {
      return getIdentifier(start, end);
    } else {
      return getLiteral(start, end);
    }
  }

  function getIdentifier(start, end) {
    if (start !== end) {
      throw new Error('Unexpected identifier count');
    }
    const token = tokens[start];
    if (token.type === tokenTypes.IDENTIFIER) {
      return astFactory.IDENTIFIER(token.value);
    }
    throw new Error('Unexpected identifier token type: ' + token.type)
  }

  function getLiteral(start, end) {
    if (start !== end) {
      throw new Error('Unexpected literal count');
    }
    const token = tokens[start];
    if (token.type === tokenTypes.NUMBER || token.type === tokenTypes.STRING || token.type === tokenTypes.BOOLEAN || token.type === tokenTypes.NULL) {
      return astFactory.LITERAL(token.value);
    }
    throw new Error('Unexpected literal token type: ' + token.type);
  }

  function maskArguments(start, end) {
    if (start !== end) {
      return null;
    }
    const token = tokens[start];
    if (token.type === tokenTypes.ARGUMENT) {
      token.value = args[token.value];
      if (typeof token.value === 'string') {
        token.type = tokenTypes.STRING;
      } else if (typeof token.value === 'number') {
        token.type = tokenTypes.NUMBER;
      } else if (typeof token.value === 'boolean') {
        token.type = tokenTypes.BOOLEAN;
      } else if (token.value === null) {
        token.type = tokenTypes.NULL;
      } else if (token.value === undefined) {
        token.type = tokenTypes.IDENTIFIER;
      } else {
        throw new Error('Unexpected argument type: ' + token.value);
      }
    }
  }

  function walk(start, end) {
    if (start > end) {
      throw new Error('Walk: start > end');
    }

    const literal = getLiteralOrIdentifier(start, end);
    if (literal) {
      return literal;
    }

    const unaryExpression = getUnaryExpression(start, end);
    if (unaryExpression) {
      return unaryExpression;
    }

    if (
      tokens[start].type === tokenTypes.PARENTHESIS
      && tokens[start].value === '('
      && tokens[end].type === tokenTypes.PARENTHESIS
      && tokens[end].value === ')'
    ) {
      start++;
      end--;
    }

    const logicalExpressionIndex = getLogicalExpressionIndex(start, end);
    if (logicalExpressionIndex !== -1) {
      return astFactory.LOGICAL_EXPRESSION(
        tokens[logicalExpressionIndex].value,
        walk(start, logicalExpressionIndex - 1),
        walk(logicalExpressionIndex + 1, end),
      );
    }

    const binaryExpressionIndex = getBinaryExpressionIndex(start, end);
    if (binaryExpressionIndex !== -1) {
      return astFactory.BINARY_EXPRESSION(
        tokens[binaryExpressionIndex].value,
        walk(start, binaryExpressionIndex - 1),
        walk(binaryExpressionIndex + 1, end),
      );
    }

    throw new Error('Unexpected expression');
  }

  function getStatements() {
    let start = 0;
    const end = length - 1;
    let statements = [];
    for (let i = start; i <= end; i++) {
      if (tokens[i].type === tokenTypes.LABEL && tokens[i].value === ';') {
        statements.push(astFactory.EXPRESSION_STATEMENT(walk(start, i - 1)));
        start = i + 1;
      }
    }
    if (tokens[end].type === tokenTypes.LABEL && tokens[end].value === ';') {
      statements.push(astFactory.EXPRESSION_STATEMENT(walk(start, end - 1)));
    } else {
      statements.push(astFactory.EXPRESSION_STATEMENT(walk(start, end)));
    }
    return statements;
  }

  return astFactory.PROGRAM(getStatements());
}

compiler.parser = parser;

function execute(ast) {
  if (ast.type === astTypes.PROGRAM) {
    for (let i = 0, l = ast.body.length - 1; i < l; i++) {
      execute(ast.body[i]);
    }
    return execute(ast.body[ast.body.length - 1]);
  }
  if (ast.type === astTypes.EXPRESSION_STATEMENT) {
    return execute(ast.expression);
  }
  if (ast.type === astTypes.LOGICAL_EXPRESSION) {
    if (ast.operator === '&&') {
      return execute(ast.left) && execute(ast.right);
    }
    if (ast.operator === '||') {
      return execute(ast.left) && execute(ast.right);
    }
    throw new Error('Unexpected LOGICAL_EXPRESSION operator: ' + ast.operator);
  }
  if (ast.type === astTypes.BINARY_EXPRESSION) {
    if (ast.operator === '===') {
      return execute(ast.left) === execute(ast.right);
    }
    if (ast.operator === '==') {
      return execute(ast.left) == execute(ast.right);
    }
    if (ast.operator === '>') {
      return execute(ast.left) > execute(ast.right);
    }
    if (ast.operator === '<') {
      return execute(ast.left) < execute(ast.right);
    }
    if (ast.operator === '<=') {
      return execute(ast.left) <= execute(ast.right);
    }
    if (ast.operator === '>=') {
      return execute(ast.left) >= execute(ast.right);
    }
    if (ast.operator === '!=') {
      return execute(ast.left) != execute(ast.right);
    }
    if (ast.operator === '!==') {
      return execute(ast.left) !== execute(ast.right);
    }
    throw new Error('Unexpected BINARY_EXPRESSION operator: ' + ast.operator);
  }
  if (ast.type === astTypes.LITERAL) {
    return ast.value;
  }
  if (ast.type === astTypes.UNARY_EXPRESSION) {
    if (ast.operator === '-') {
      return -ast.argument.value;
    }
    if (ast.operator === '+') {
      return +ast.argument.value;
    }
    if (ast.operator === '!') {
      return !ast.argument.value;
    }
    throw new Error('Unexpected UNARY_EXPRESSION operator: ' + ast.operator);
  }
  if (ast.type === astTypes.IDENTIFIER) {
    if (ast.name === 'undefined') {
      return undefined;
    }
    throw new Error('Unexpected identifier name: ' + ast.name);
  }
  throw new Error('Unexpected ast type: ' + ast.type);
}

compiler.execute = execute;

function compiler(input, args) {
  const tokens = tokenizer(input);
  const ast = parser(tokens, args);
  return execute(ast);
}

module.exports = compiler;
