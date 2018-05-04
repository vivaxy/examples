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
};

compiler.tokenTypes = tokenTypes;

const astTypes = {
  PROGRAM: 'Program',
  EXPRESSION_STATEMENT: 'ExpressionStatement',
  LITERAL: 'Literal',
  BINARY_EXPRESSION: 'BinaryExpression',
  UNARY_EXPRESSION: 'UnaryExpression',
  LOGICAL_EXPRESSION: 'LogicalExpression',
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
};

compiler.astFactory = astFactory;

function tokenizer(input) {
  let tokens = [];
  let i = 0;
  const length = input.length;

  function pushToken(type, value, extraLength) {
    if (type === tokenTypes.NUMBER) {
      value = Number(value);
    }
    if (type === tokenTypes.BOOLEAN) {
      if (value !== 'true' && value !== 'false') {
        throw new Error('Error BOOLEAN token: ' + value);
      }
      value = value === 'true';
    }
    if (!extraLength) {
      extraLength = 0;
    }
    tokens.push({
      type,
      value,
    });
    i += value.length + extraLength;
  }

  while (i < length) {
    let char = input[i];
    if (char === ' ') {
      i++;
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
    if (NUMBERS.test(char)) {
      let value = '';
      let j = 0;
      while (NUMBERS.test(char)) {
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
    throw new Error('Unexpected token: ' + char);
  }
  return tokens;
}

compiler.tokenizer = tokenizer;

function parser(tokens, args) {
  const ast = astFactory.PROGRAM([]);

  let length = tokens.length;

  ast.body.push(walk(0, length - 1));

  function getLogicalExpressionIndex(start, end) {
    for (let i = end; i >= start; i--) {
      if (
        tokens[i].type === tokenTypes.LOGICAL_OPERATOR
        && tokens[i].value === '&&'
        && tokens[i].value === '||'
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

  function walk(start, end) {
    let logicalIndex = getLogicalExpressionIndex(start, end);
    let expression;
    if (logicalIndex === -1) {
        let binaryExpressionIndex = getBinaryExpressionIndex(start, end);
        expression = astFactory.BINARY_EXPRESSION();
    } else {
      let leftExpression = null;
      let rightExpression = null;
      expression = astFactory.LOGICAL_EXPRESSION(tokens[logicalIndex].value, leftExpression, rightExpression);
    }
    return astFactory.EXPRESSION_STATEMENT(expression);

    let token = tokens[i];
    if (token.type === tokenTypes.NUMBER) {
      i++;
      return astFactory.NUMBER_LITERAL(token.value);
    }
    if (token.type === tokenTypes.STRING) {
      i++;
      return {
        type: astTypes.STRING_LITERAL,
        value: token.value,
      };
    }
    if (token.type === tokenTypes.BOOLEAN) {
      i++;
      return {
        type: astTypes.BOOLEAN_LITERAL,
        value: token.value,
      };
    }
    if (token.type === tokenTypes.ARGUMENT) {
      i++;
      const value = args[token.value];
      if (typeof value === 'string') {
        return {
          type: astTypes.STRING_LITERAL,
          value,
        };
      } else if (typeof value === 'boolean') {
        return {
          type: astTypes.BOOLEAN_LITERAL,
          value,
        };
      } else if (typeof value === 'number') {
        return {
          type: astTypes.NUMBER_LITERAL,
          value,
        };
      } else {
        throw new Error('Unexpected argument: ' + token.value);
      }
    }
    if (token.type === tokenTypes.COMPARISON_OPERATOR) {
      i++;
      return {
        type: astTypes.BINARY_OPERATOR,
        value: token.value,
      };
    }
    if (token.type === tokenTypes.LOGICAL_OPERATOR) {
      i++;
      return {
        type: astTypes.BINARY_OPERATOR,
        value: token.value,
      };
    }
    if (token.type === tokenTypes.PARENTHESIS && token.value === '(') {
      let body = [];
      token = tokens[++i];
      while ((token.type !== tokenTypes.PARENTHESIS) || (token.type === tokenTypes.PARENTHESIS && token.value !== ')')) {
        body.push(walk());
        token = tokens[i];
      }
      i++;
      return {
        type: astTypes.PARENTHESIS,
        body,
      };
    }
    throw TypeError(token.type);
  }

  return ast;
}

compiler.parser = parser;

function execute(ast) {
  function evaluate(nodes) {
    let nodeArray = nodes.slice();
    let prevLength = nodeArray.length + 1;
    while (nodeArray.length > 1) {
      // console.log(nodeArray);
      if (prevLength === nodeArray.length) {
        throw new Error('Unconsumable nodes');
      }
      prevLength = nodeArray.length;
      const node0 = nodeArray[0];
      const node1 = nodeArray[1];
      const node2 = nodeArray[2];
      if (node0.type === astTypes.PARENTHESIS) {
        nodeArray.splice(0, 1, evaluate(node0.body));
        prevLength++;
      } else if (node2.type === astTypes.PARENTHESIS) {
        nodeArray.splice(2, 1, evaluate(node2.body));
        prevLength++;
      } else if (
        node0.type === astTypes.UNARY_OPERATOR
        && (
          node1.type === astTypes.NUMBER_LITERAL
          || node1.type === astTypes.STRING_LITERAL
          || node1.type === astTypes.BOOLEAN_LITERAL
        )
      ) {
        nodeArray.splice(0, 2);
        if (node0.value === '+') {
          nodeArray.unshift({
            type: astTypes.NUMBER_LITERAL,
            value: +node1.value,
          });
        } else if (node0.value === '-') {
          nodeArray.unshift({
            type: astTypes.NUMBER_LITERAL,
            value: -node1.value,
          });
        } else {
          throw new Error('Unexpected UNARY_OPERATOR: ' + node0.value);
        }
      } else if (node0.type === astTypes.UNARY_OPERATOR && node1.type === astTypes.BOOLEAN_LITERAL) {
        nodeArray.splice(0, 2);
        if (node0.value === '!') {
          nodeArray.unshift({
            type: astTypes.BOOLEAN_LITERAL,
            value: !node1.value,
          });
        } else {
          throw new Error('Unexpected UNARY_OPERATOR: ' + node0.value);
        }
      } else if (node0.type === astTypes.NUMBER_LITERAL && node1.type === astTypes.UNARY_OPERATOR) {
        nodeArray.splice(0, 2);
        if (node1.value === '++') {
          nodeArray.unshift({
            type: astTypes.NUMBER_LITERAL,
            value: node0.value++,
          });
        } else if (node1.value === '--') {
          nodeArray.unshift({
            type: astTypes.NUMBER_LITERAL,
            value: node0.value++,
          });
        } else {
          throw new Error('Unexpected UNARY_OPERATOR: ' + node1.value);
        }
      } else if (
        node2
        && node0.type === astTypes.NUMBER_LITERAL
        && node1.type === astTypes.BINARY_OPERATOR
        && node2.type === astTypes.NUMBER_LITERAL
      ) {
        nodeArray.splice(0, 3);
        if (node1.value === '+') {
          nodeArray.unshift({
            type: astTypes.NUMBER_LITERAL,
            value: node0.value + node2.value,
          });
        } else if (node1.value === '-') {
          nodeArray.unshift({
            type: astTypes.NUMBER_LITERAL,
            value: node0.value - node2.value,
          });
        } else if (node1.value === '*') {
          nodeArray.unshift({
            type: astTypes.NUMBER_LITERAL,
            value: node0.value * node2.value,
          });
        } else if (node1.value === '%') {
          nodeArray.unshift({
            type: astTypes.NUMBER_LITERAL,
            value: node0.value % node2.value,
          });
        } else if (node1.value === '**') {
          nodeArray.unshift({
            type: astTypes.NUMBER_LITERAL,
            value: node0.value ** node2.value,
          });
        } else if (node1.value === '===') {
          nodeArray.unshift({
            type: astTypes.BOOLEAN_LITERAL,
            value: node0.value === node2.value,
          });
        } else if (node1.value === '==') {
          nodeArray.unshift({
            type: astTypes.BOOLEAN_LITERAL,
            value: node0.value == node2.value,
          });
        } else if (node1.value === '>') {
          nodeArray.unshift({
            type: astTypes.BOOLEAN_LITERAL,
            value: node0.value > node2.value,
          });
        } else if (node1.value === '<') {
          nodeArray.unshift({
            type: astTypes.BOOLEAN_LITERAL,
            value: node0.value < node2.value,
          });
        } else if (node1.value === '>=') {
          nodeArray.unshift({
            type: astTypes.BOOLEAN_LITERAL,
            value: node0.value >= node2.value,
          });
        } else if (node1.value === '<=') {
          nodeArray.unshift({
            type: astTypes.BOOLEAN_LITERAL,
            value: node0.value <= node2.value,
          });
        } else if (node1.value === '!=') {
          nodeArray.unshift({
            type: astTypes.BOOLEAN_LITERAL,
            value: node0.value != node2.value,
          });
        } else if (node1.value === '!==') {
          nodeArray.unshift({
            type: astTypes.BOOLEAN_LITERAL,
            value: node0.value !== node2.value,
          });
        } else {
          throw new Error('Unexpected BINARY_OPERATOR: ' + node1.value);
        }
      } else if (
        node2
        && node0.type === astTypes.BOOLEAN_LITERAL
        && node1.type === astTypes.BINARY_OPERATOR
        && node2.type === astTypes.BOOLEAN_LITERAL
      ) {
        if (node1.value === '&&') {
          nodeArray.splice(0, 3);
          nodeArray.unshift({
            type: astTypes.BOOLEAN_LITERAL,
            value: node0.value && node2.value,
          });
        } else if (node1.value === '||') {
          nodeArray.unshift({
            type: astTypes.BOOLEAN_LITERAL,
            value: node0.value || node2.value,
          });
        }
      } else {
        throw new Error('Unexpected BINARY_OPERATOR: ' + node1.value);
      }
    }
    return nodeArray[0];
  }

  return evaluate(ast.body).value;
}

compiler.execute = execute;

function compiler(input) {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  return execute(ast);
}

module.exports = compiler;
