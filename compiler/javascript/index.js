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
  BOOLEAN: 'boolean',
  PARENTHESIS: 'parenthesis',
  LABEL: 'label', // ;, ,
  NULL: 'null',
  IDENTIFIER: 'identifier', // 变量, undefined
};

compiler.tokenTypes = tokenTypes;

const astTypes = {
  PROGRAM: 'Program',
  EXPRESSION_STATEMENT: 'ExpressionStatement',
  LITERAL: 'Literal',
  BINARY_EXPRESSION: 'BinaryExpression',
  /**
   * void
   * +
   * -
   * !
   */
  UNARY_EXPRESSION: 'UnaryExpression',
  LOGICAL_EXPRESSION: 'LogicalExpression',
  IDENTIFIER: 'Identifier',
  SEQUENCE_EXPRESSION: 'SequenceExpression',
  CONDITIONAL_EXPRESSION: 'ConditionalExpression',
};

compiler.astTypes = astTypes;

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
 */
const binaryOperatorPrecedence = {
  '**': 15,
  '*': 14,
  '/': 14,
  '%': 14,
  '+': 13,
  '-': 13,
  '<': 11,
  '<=': 11,
  '>': 11,
  '>=': 11,
  '==': 10,
  '!=': 10,
  '===': 10,
  '!==': 10,
  '&': 9,
  '^': 8,
  '|': 7,
};

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
  SEQUENCE_EXPRESSION: (expressions) => {
    return { type: astTypes.SEQUENCE_EXPRESSION, expressions };
  },
  CONDITIONAL_EXPRESSION: (test, consequent, alternate) => {
    return { type: astTypes.CONDITIONAL_EXPRESSION, test, consequent, alternate };
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
    if (char === ',') {
      pushToken(tokenTypes.LABEL, char);
      continue;
    }
    if (char === ';') {
      pushToken(tokenTypes.LABEL, char);
      continue;
    }
    if (char === '*' || char === '+' || char === '-') {
      const nextChar = input[i + 1];
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
      pushToken(tokenTypes.BITWISE_OPERATOR, char);
      continue;
    }
    if (char === '^' || char === '~') {
      pushToken(tokenTypes.BITWISE_OPERATOR, char);
      continue;
    }
    if (char === '<') {
      const nextChar = input[i + 1];
      if (nextChar === '=') {
        pushToken(tokenTypes.COMPARISON_OPERATOR, '<=');
        continue;
      }
      if (nextChar === '<') {
        pushToken(tokenTypes.COMPARISON_OPERATOR, '<<');
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
      if (nextChar === '>') {
        if (input[i + 2] === '>') {
          pushToken(tokenTypes.COMPARISON_OPERATOR, '>>>');
          continue;
        }
        pushToken(tokenTypes.COMPARISON_OPERATOR, '>>');
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
    if (matchToken('void', tokenTypes.LABEL)) {
      continue;
    }
    if (matchToken('true', tokenTypes.BOOLEAN)) {
      continue;
    }
    if (matchToken('false', tokenTypes.BOOLEAN)) {
      continue;
    }
    if (matchToken('null', tokenTypes.NULL)) {
      continue;
    }
    if (matchToken('undefined', tokenTypes.IDENTIFIER)) {
      continue;
    }

    function matchToken(pattern, tokenType) {
      if (input.slice(i, i + pattern.length) === pattern) {
        pushToken(tokenType, pattern);
        return true;
      }
      return false;
    }

    throw new Error('Unexpected token: ' + char);
  }
  return tokens;
}

compiler.tokenizer = tokenizer;

function parser(tokens, args) {
  let length = tokens.length;

  function getLogicalExpression(start, end) {
    let logicalExpressionIndex = -1;
    for (let i = end; i >= start; i--) {
      // && precedence is higher than ||
      if (tokens[i].type === tokenTypes.LOGICAL_OPERATOR && tokens[i].value === '&&') {
        logicalExpressionIndex = i;
      }
    }
    for (let i = end; i >= start; i--) {
      if (tokens[i].type === tokenTypes.LOGICAL_OPERATOR && tokens[i].value === '||') {
        logicalExpressionIndex = i;
      }
    }

    if (logicalExpressionIndex !== -1) {
      return astFactory.LOGICAL_EXPRESSION(
        tokens[logicalExpressionIndex].value,
        walk(start, logicalExpressionIndex - 1),
        walk(logicalExpressionIndex + 1, end),
      );
    }
    return null;
  }

  function getBinaryExpression(start, end) {
    let operatorIndex = -1;
    let i = start;
    while (i <= end) {
      const token = tokens[i];
      if (token.type === tokenTypes.PARENTHESIS && token.value === '(') {
        const groupEnd = getGroupingEnd(i, end);
        if (groupEnd === -1) {
          throw new Error('Grouping not match');
        }
        i = groupEnd + 1;
        continue;
      }
      const prevToken = tokens[i - 1];
      if (
        (
          (
            token.type === tokenTypes.ARITHMETIC_OPERATOR ||
            token.type === tokenTypes.COMPARISON_OPERATOR ||
            (
              token.type === tokenTypes.BITWISE_OPERATOR &&
              (
                token.value === '&' ||
                token.value === '|' ||
                token.value === '^'
              )
            )
          ) &&
          prevToken &&
          (
            prevToken.type === tokenTypes.NUMBER ||
            prevToken.type === tokenTypes.STRING ||
            prevToken.type === tokenTypes.BOOLEAN ||
            prevToken.type === tokenTypes.IDENTIFIER ||
            prevToken.type === tokenTypes.NULL ||
            prevToken.type === tokenTypes.ARGUMENT ||
            (
              prevToken.type === tokenTypes.PARENTHESIS &&
              prevToken.value === ')'
            )
          )
        )
      ) {
        // valid binary operator
        if (operatorIndex === -1) {
          operatorIndex = i;
        } else if (operatorIndex !== -1) {
          const prevToken = tokens[operatorIndex].value;
          const currToken = token.value;
          if (!binaryOperatorPrecedence[prevToken]) {
            throw new Error('Missing operator precedence: ' + prevToken);
          }
          if (!binaryOperatorPrecedence[currToken]) {
            throw new Error('Missing operator precedence: ' + currToken);
          }
          if (binaryOperatorPrecedence[prevToken] > binaryOperatorPrecedence[currToken]) {
            operatorIndex = i;
          }
        }
      }
      i++;
    }
    if (operatorIndex === -1) {
      return null;
    }
    if (operatorIndex === start) {
      return null;
    }
    if (operatorIndex === end) {
      return null;
    }

    return astFactory.BINARY_EXPRESSION(
      tokens[operatorIndex].value,
      walk(start, operatorIndex - 1),
      walk(operatorIndex + 1, end),
    );
  }

  function getUnaryExpression(start, end) {
    if (getGroupingEnd(start + 1, end) === -1 && end - start !== 1) {
      return null;
    }
    const token = tokens[start];
    if (
      (token.type === tokenTypes.ARITHMETIC_OPERATOR && (
        token.value === '-' ||
        token.value === '+'
      )) ||
      (token.type === tokenTypes.LOGICAL_OPERATOR && token.value === '!') ||
      (token.type === tokenTypes.LABEL && token.value === 'void') ||
      (token.type === tokenTypes.BITWISE_OPERATOR && token.value === '~')
    ) {
      return astFactory.UNARY_EXPRESSION(token.value, getLiteralOrIdentifier(start + 1, end));
    }
    return null;
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
    throw new Error('Unexpected identifier token type: ' + token.type);
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
        token.value = 'undefined';
      } else {
        throw new Error('Unexpected argument type: ' + token.value);
      }
    }
  }

  function getSequenceExpressions(start, end) {
    let sequenceExpressions = [];
    let prevStart = start;
    for (let i = start; i <= end; i++) {
      if (tokens[i].type === tokenTypes.LABEL && tokens[i].value === ',') {
        sequenceExpressions.push(walk(prevStart, i - 1));
        prevStart = i + 1;
      }
    }
    if (prevStart !== start) {
      sequenceExpressions.push(walk(prevStart, end));
    }
    if (sequenceExpressions.length) {
      return astFactory.SEQUENCE_EXPRESSION(sequenceExpressions);
    }
    return null;
  }

  function getGroupingEnd(start, end) {
    let token = tokens[start];
    if (token.type !== tokenTypes.PARENTHESIS || token.value !== '(') {
      return -1;
    }
    let depth = 1;
    for (let i = start + 1; i <= end; i++) {
      token = tokens[i];
      if (token.type === tokenTypes.PARENTHESIS && token.value === '(') {
        depth++;
      }
      if (token.type === tokenTypes.PARENTHESIS && token.value === ')') {
        depth--;
        if (depth === 0) {
          return i;
        }
      }
    }

    return -1;
  }

  function getConditionalExpression(start, end) {
    let questionMarkIndex = -1;
    let colonIndex = -1;
    for (let i = start; i <= end; i++) {
      if (questionMarkIndex !== -1 && colonIndex !== -1) {
        break;
      }
      if (questionMarkIndex === -1 && tokens[i].type === tokenTypes.CONDITIONAL_OPERATOR && tokens[i].value === '?') {
        questionMarkIndex = i;
      }
      if (colonIndex === -1 && tokens[i].type === tokenTypes.CONDITIONAL_OPERATOR && tokens[i].value === ':') {
        colonIndex = i;
      }
    }
    if (questionMarkIndex === -1 || colonIndex === -1) {
      return null;
    }
    return astFactory.CONDITIONAL_EXPRESSION(walk(start, questionMarkIndex - 1), walk(questionMarkIndex + 1, colonIndex - 1), walk(colonIndex + 1, end));
  }

  function walk(start, end) {
    if (start > end) {
      throw new Error('Walk: start > end');
    }

    const groupEnd = getGroupingEnd(start, end);
    if (groupEnd === end) {
      return walk(start + 1, end - 1);
    }

    const literal = getLiteralOrIdentifier(start, end);
    if (literal) {
      return literal;
    }

    const sequenceExpressions = getSequenceExpressions(start, end); // 1
    if (sequenceExpressions) {
      return sequenceExpressions;
    }

    const conditionalExpression = getConditionalExpression(start, end); // 4
    if (conditionalExpression) {
      return conditionalExpression;
    }

    const logicalExpression = getLogicalExpression(start, end); // 5, 6
    if (logicalExpression) {
      return logicalExpression;
    }

    const binaryExpression = getBinaryExpression(start, end); // 7, 8, 9, 10, 11, 12, 13, 14, 15
    if (binaryExpression) {
      return binaryExpression;
    }

    const unaryExpression = getUnaryExpression(start, end); // 16
    if (unaryExpression) {
      return unaryExpression;
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

/**
 * @param ast
 * @returns {*}
 */
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
  if (ast.type === astTypes.SEQUENCE_EXPRESSION) {
    for (let i = 0; i < ast.expressions.length - 1; i++) {
      execute(ast.expressions[i]);
    }
    return execute(ast.expressions[ast.expressions.length - 1]);
  }
  if (ast.type === astTypes.LOGICAL_EXPRESSION) {
    if (ast.operator === '&&') {
      return execute(ast.left) && execute(ast.right);
    }
    if (ast.operator === '||') {
      return execute(ast.left) || execute(ast.right);
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
    if (ast.operator === '+') {
      return execute(ast.left) + execute(ast.right);
    }
    if (ast.operator === '-') {
      return execute(ast.left) - execute(ast.right);
    }
    if (ast.operator === '*') {
      return execute(ast.left) * execute(ast.right);
    }
    if (ast.operator === '/') {
      return execute(ast.left) / execute(ast.right);
    }
    if (ast.operator === '%') {
      return execute(ast.left) % execute(ast.right);
    }
    if (ast.operator === '**') {
      return execute(ast.left) ** execute(ast.right);
    }
    if (ast.operator === '&') {
      return execute(ast.left) & execute(ast.right);
    }
    if (ast.operator === '|') {
      return execute(ast.left) | execute(ast.right);
    }
    if (ast.operator === '^') {
      return execute(ast.left) ^ execute(ast.right);
    }
    if (ast.operator === '>>') {
      return execute(ast.left) >> execute(ast.right);
    }
    if (ast.operator === '<<') {
      return execute(ast.left) << execute(ast.right);
    }
    if (ast.operator === '>>>') {
      return execute(ast.left) >>> execute(ast.right);
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
    if (ast.operator === 'void') {
      return undefined;
    }
    if (ast.operator === '~') {
      return ~ast.argument.value;
    }
    throw new Error('Unexpected UNARY_EXPRESSION operator: ' + ast.operator);
  }
  if (ast.type === astTypes.IDENTIFIER) {
    if (ast.name === 'undefined') {
      return undefined;
    }
    throw new Error('Unexpected identifier name: ' + ast.name);
  }
  if (ast.type === astTypes.CONDITIONAL_EXPRESSION) {
    return execute(ast.test) ? execute(ast.consequent) : execute(ast.alternate);
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
