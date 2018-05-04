/**
 * @since 20180503 11:42
 * @author vivaxy
 */

const test = require('ava');
const compiler = require('../index.js');
const tokenTypes = compiler.tokenTypes;
const astTypes = compiler.astTypes;
const tokenizer = compiler.tokenizer;
const parser = compiler.parser;
const execute = compiler.execute;

test('tokenizer', (t) => {
  t.deepEqual(tokenizer('{{userGrade}} == 0'), [
    {
      type: tokenTypes.ARGUMENT,
      value: 'userGrade',
    },
    {
      type: tokenTypes.COMPARISON_OPERATOR,
      value: '==',
    },
    {
      type: tokenTypes.NUMBER,
      value: 0,
    },
  ]);

  t.deepEqual(tokenizer('"test"===\'value\''), [
    {
      type: tokenTypes.STRING,
      value: 'test',
    },
    {
      type: tokenTypes.COMPARISON_OPERATOR,
      value: '===',
    },
    {
      type: tokenTypes.STRING,
      value: 'value',
    },
  ]);
});

test('parser', (t) => {
  t.deepEqual(parser(tokenizer('1 === 2')), {
    type: astTypes.PROGRAM,
    body: [
      {
        type: astTypes.EXPRESSION_STATEMENT,
        value: 1,
      },
      {
        type: astTypes.BINARY_OPERATOR,
        value: '===',
      },
      {
        type: astTypes.NUMBER_LITERAL,
        value: 2,
      },
    ],
  });
  t.deepEqual(parser(tokenizer('1 === 1 && (1 === 2)')), {
    type: astTypes.PROGRAM,
    body: [
      {
        type: astTypes.NUMBER_LITERAL,
        value: 1,
      },
      {
        type: astTypes.BINARY_OPERATOR,
        value: '===',
      },
      {
        type: astTypes.NUMBER_LITERAL,
        value: 1,
      },
      {
        type: astTypes.BINARY_OPERATOR,
        value: '&&',
      },
      {
        type: astTypes.PARENTHESIS,
        body: [
          {
            type: astTypes.NUMBER_LITERAL,
            value: 1,
          },
          {
            type: astTypes.BINARY_OPERATOR,
            value: '===',
          },
          {
            type: astTypes.NUMBER_LITERAL,
            value: 2,
          },
        ],
      },
    ],
  });
});

// test('execute', (t) => {
  // t.deepEqual(execute(parser(tokenizer('1 === 1 && (1 === 2)'))), false);
  // t.deepEqual(execute(parser(tokenizer('1 === 1 && 1 === 2'))), false);
  // t.deepEqual(execute(parser(tokenizer('{{userGrade}} > 1'), { userGrade: 1 })), false);
  // t.deepEqual(execute(parser(tokenizer('{{userGrade}} >= 1'), { userGrade: 1 })), true);
  // t.deepEqual(execute(parser(tokenizer('{{userGrade}} >= 1 && {{userName}} === \'test\''), {
  //   userGrade: 1,
  //   userName: 'test',
  // })), true);
// });
