/**
 * @since 2019-06-07 14:04:05
 * @author vivaxy
 *
 * @see https://github.com/dt-fe/weekly/blob/v2/064.%E7%B2%BE%E8%AF%BB%E3%80%8A%E6%89%8B%E5%86%99%20SQL%20%E7%BC%96%E8%AF%91%E5%99%A8%20-%20%E8%AF%8D%E6%B3%95%E5%88%86%E6%9E%90%E3%80%8B.md
 * 4 Steps
 *  1. 词法分析，将 SQL 字符串拆分成包含关键词识别的字符段（Tokens）。
 *  2. 语法分析，利用自顶向下或自底向上的算法，将 Tokens 解析为 AST，可以手动，也可以自动。
 *  3. 错误检测、恢复、提示推断，都需要利用语法分析产生的 AST。
 *  4. 语义分析，做完这一步就可以执行 SQL 语句了，不过对前端而言，不需要深入到这一步，可以跳过。
 */

/**
 * 1. 词法分析
 *  SQL Tokens:
 *    1. 注释。
 *    2. 关键字（SELECT、CREATE）。
 *    3. 操作符（+、-、>=）。
 *    4. 开闭合标志（(、CASE）。
 *    5. 占位符（?）。
 *    6. 空格。
 *    7. 引号包裹的文本、数字、字段。
 *    8. 方言语法（${variable}）。
 */

export enum TYPES {
  BLOCK_COMMENT = 1,
  KEYWORD = 2,
  OPERATOR = 3,
  OPEN_CLOSE = 4,
  PLACEHOLDER = 5,
  WHITE_SPACE = 6,
  LITERAL = 7,
  DIALECT = 8,
  COMMA = 9,
}

interface Token {
  type: TYPES;
  value: any;
}

function getTokenWhitespace(restStr: string) {
  const matches = restStr.match(/^(\s+)/);

  if (matches) {
    return { type: TYPES.WHITE_SPACE, value: matches[1] };
  }
}

function getTokenBlockComment(restStr: string) {
  const matches = restStr.match(/^(\/\*[^]*?(?:\*\/|$))/);

  if (matches) {
    return { type: TYPES.BLOCK_COMMENT, value: matches[1] };
  }
}

function getTokenKeyword(restStr: string) {
  const keywords = ['select', 'from'];
  for (const keyword of keywords) {
    if (restStr.startsWith(keyword)) {
      return {
        type: TYPES.KEYWORD,
        value: keyword,
      };
    }
  }
}

function getTokenLiteral(restStr: string) {
  const matches = restStr.match(/^([a-zA-Z0-9]+)/);
  if (matches) {
    return { type: TYPES.LITERAL, value: matches[1] };
  }
}

function getTokenComma(restStr: string) {
  const matches = restStr.match(/,/);
  if (matches) {
    return { type: TYPES.COMMA, value: matches[0] };
  }
}

export function tokenize(sqlStr: string) {
  let tokens: Token[] = [];
  let token: Token;

  while (sqlStr) {
    const _token =
      getTokenWhitespace(sqlStr) ||
      getTokenBlockComment(sqlStr) ||
      getTokenKeyword(sqlStr) ||
      getTokenLiteral(sqlStr) ||
      getTokenComma(sqlStr);

    if (!_token) {
      throw new Error('Unexpected token: ' + sqlStr);
    }

    token = _token;
    sqlStr = sqlStr.substring(token.value.length);

    tokens.push(token);
  }

  return tokens;
}

/**
 * @see https://github.com/dt-fe/weekly/blob/v2/065.%E7%B2%BE%E8%AF%BB%E3%80%8A%E6%89%8B%E5%86%99%20SQL%20%E7%BC%96%E8%AF%91%E5%99%A8%20-%20%E6%96%87%E6%B3%95%E4%BB%8B%E7%BB%8D%E3%80%8B.md
 * 文法：描述语言的语法规则
 * 一块语法规则称为 产生式，使用 “Left → Right” 表示任意产生式，用 “Left ⇒ Right” 表示产生式的推导过程
 */
export function parse(tokens: Token[]) {
  let tokenIndex = 0;

  function match(word: string | RegExp): boolean {
    const currentToken = tokens[tokenIndex]; // 拿到当前所在的 Token

    if (
      currentToken.type === TYPES.WHITE_SPACE ||
      currentToken.type === TYPES.BLOCK_COMMENT
    ) {
      tokenIndex++;
      return match(word);
    }

    if (
      (typeof word === 'string' && currentToken.value === word) ||
      (word instanceof RegExp && word.test(currentToken.value))
    ) {
      // 如果 Token 匹配上了，则下移一位，同时返回 true
      tokenIndex++;
      return true;
    }

    // 没有匹配上，不消耗 Token，但是返回 false
    return false;
  }

  function tree(...args: any[]) {
    const startTokenIndex = tokenIndex;
    return args.some((arg) => {
      const result = arg();

      if (!result) {
        tokenIndex = startTokenIndex; // 执行失败则还原 TokenIndex
      }

      return result;
    });
  }

  const word = () => match(/[a-zA-Z]*/);

  const functional = () => false;

  const field = () => tree(word, functional);

  const optional = (val: boolean) => tree(() => val, () => true);

  const selectList: () => boolean = () =>
    field() && optional(match(',') && selectList());

  const root = () =>
    match('select') && selectList() && match('from') && match('b');

  if (root() && tokenIndex === tokens.length) {
    return true;
  }

  return false;
}
