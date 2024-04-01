/**
 * @since 2024-04-01
 * @author vivaxy
 */
/**
 * 词法分析器
 * @version 0.2
 * @author 宫文学
 * @license 木兰开源协议
 * @since 2021-06-04
 *
 * 缺失的特性：
 * 1.不支持Unicode；
 * 2.不支持二进制、八进制、十六进制
 * 3.不支持转义
 * 4.字符串只支持双引号
 */

//Token的类型
export const TokenKind = {
  Keyword: 'Keyword',
  Identifier: 'Identifier',
  StringLiteral: 'StringLiteral',
  IntegerLiteral: 'IntegerLiteral',
  DecimalLiteral: 'DecimalLiteral',
  NullLiteral: 'NullLiteral',
  BooleanLiteral: 'BooleanLiteral',
  Separator: 'Separator',
  Operator: 'Operator',
  EOF: 'EOF',
};

/**
 * 一个字符串流。其操作为：
 * peek():预读下一个字符，但不移动指针；
 * next():读取下一个字符，并且移动指针；
 * eof():判断是否已经到了结尾。
 */
export class CharStream {
  pos = 0;
  line = 1;
  col = 0;

  constructor(data) {
    this.data = data;
  }

  peek() {
    return this.data.charAt(this.pos);
  }

  next() {
    let ch = this.data.charAt(this.pos++);
    if (ch === '\n') {
      this.line++;
      this.col = 0;
    } else {
      this.col++;
    }
    return ch;
  }

  eof() {
    return this.peek() === '';
  }
}

/**
 * 词法分析器。
 * 词法分析器的接口像是一个流，词法解析是按需进行的。
 * 支持下面两个操作：
 * next(): 返回当前的Token，并移向下一个Token。
 * peek(): 预读当前的Token，但不移动当前位置。
 * peek2(): 预读第二个Token。
 */
export class Scanner {
  tokens = []; //采用一个array，能预存多个Token.
  static KeyWords = new Set([
    'function',
    'class',
    'break',
    'delete',
    'return',
    'case',
    'do',
    'if',
    'switch',
    'var',
    'catch',
    'else',
    'in',
    'this',
    'void',
    'continue',
    'false',
    'instanceof',
    'throw',
    'while',
    'debugger',
    'finally',
    'new',
    'true',
    'with',
    'default',
    'for',
    'null',
    'try',
    'typeof',
    //下面这些用于严格模式
    'implements',
    'let',
    'private',
    'public',
    'yield',
    'interface',
    'package',
    'protected',
    'static',
  ]);

  constructor(stream) {
    this.stream = stream;
  }

  next() {
    let t = this.tokens.shift();
    if (typeof t == 'undefined') {
      return this.getAToken();
    } else {
      return t;
    }
  }

  peek() {
    let t = this.tokens[0];
    if (typeof t == 'undefined') {
      t = this.getAToken();
      this.tokens.push(t);
    }
    return t;
  }

  peek2() {
    let t = this.tokens[1];
    while (typeof t == 'undefined') {
      this.tokens.push(this.getAToken());
      t = this.tokens[1];
    }
    return t;
  }

  //从字符串流中获取一个新Token。
  getAToken() {
    this.skipWhiteSpaces();
    if (this.stream.eof()) {
      return { kind: TokenKind.EOF, text: '' };
    } else {
      let ch = this.stream.peek();
      if (this.isLetter(ch) || ch == '_') {
        return this.parseIdentifer();
      } else if (ch == '"') {
        return this.parseStringLiteral();
      } else if (
        ch == '(' ||
        ch == ')' ||
        ch == '{' ||
        ch == '}' ||
        ch == '[' ||
        ch == ']' ||
        ch == ',' ||
        ch == ';' ||
        ch == ':' ||
        ch == '?' ||
        ch == '@'
      ) {
        this.stream.next();
        return { kind: TokenKind.Separator, text: ch };
      }
      //解析数字字面量，语法是：
      // DecimalLiteral: IntegerLiteral '.' [0-9]*
      //   | '.' [0-9]+
      //   | IntegerLiteral
      //   ;
      // IntegerLiteral: '0' | [1-9] [0-9]* ;
      else if (this.isDigit(ch)) {
        this.stream.next();
        let ch1 = this.stream.peek();
        let literal = '';
        if (ch == '0') {
          //暂不支持八进制、二进制、十六进制
          if (!(ch1 >= '1' && ch1 <= '9')) {
            literal = '0';
          } else {
            console.log(
              '0 cannot be followed by other digit now, at line: ' +
                this.stream.line +
                ' col: ' +
                this.stream.col,
            );
            //暂时先跳过去
            this.stream.next();
            return this.getAToken();
          }
        } else if (ch >= '1' && ch <= '9') {
          literal += ch;
          while (this.isDigit(ch1)) {
            ch = this.stream.next();
            literal += ch;
            ch1 = this.stream.peek();
          }
        }
        //加上小数点.
        if (ch1 == '.') {
          //小数字面量
          literal += '.';
          this.stream.next();
          ch1 = this.stream.peek();
          while (this.isDigit(ch1)) {
            ch = this.stream.next();
            literal += ch;
            ch1 = this.stream.peek();
          }
          return { kind: TokenKind.DecimalLiteral, text: literal };
        } else {
          //返回一个整型直面量
          return { kind: TokenKind.IntegerLiteral, text: literal };
        }
      } else if (ch == '.') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (this.isDigit(ch1)) {
          //小数字面量
          let literal = '.';
          while (this.isDigit(ch1)) {
            ch = this.stream.next();
            literal += ch;
            ch1 = this.stream.peek();
          }
          return { kind: TokenKind.DecimalLiteral, text: literal };
        }
        //...省略号
        else if (ch1 == '.') {
          this.stream.next();
          //第三个.
          ch1 = this.stream.peek();
          if (ch1 == '.') {
            return { kind: TokenKind.Separator, text: '...' };
          } else {
            console.log('Unrecognized pattern : .., missed a . ?');
            return this.getAToken();
          }
        }
        //.号分隔符
        else {
          return { kind: TokenKind.Separator, text: '.' };
        }
      } else if (ch == '/') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (ch1 == '*') {
          this.skipMultipleLineComments();
          return this.getAToken();
        } else if (ch1 == '/') {
          this.skipSingleLineComment();
          return this.getAToken();
        } else if (ch1 == '=') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '/=' };
        } else {
          return { kind: TokenKind.Operator, text: '/' };
        }
      } else if (ch == '+') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (ch1 == '+') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '++' };
        } else if (ch1 == '=') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '+=' };
        } else {
          return { kind: TokenKind.Operator, text: '+' };
        }
      } else if (ch == '-') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (ch1 == '-') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '--' };
        } else if (ch1 == '=') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '-=' };
        } else {
          return { kind: TokenKind.Operator, text: '-' };
        }
      } else if (ch == '*') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (ch1 == '=') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '*=' };
        } else {
          return { kind: TokenKind.Operator, text: '*' };
        }
      } else if (ch == '%') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (ch1 == '=') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '%=' };
        } else {
          return { kind: TokenKind.Operator, text: '%' };
        }
      } else if (ch == '>') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (ch1 == '=') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '>=' };
        } else if (ch1 == '>') {
          this.stream.next();
          let ch1 = this.stream.peek();
          if (ch1 == '>') {
            this.stream.next();
            ch1 = this.stream.peek();
            if (ch1 == '=') {
              this.stream.next();
              return { kind: TokenKind.Operator, text: '>>>=' };
            } else {
              return { kind: TokenKind.Operator, text: '>>>' };
            }
          } else if (ch1 == '=') {
            this.stream.next();
            return { kind: TokenKind.Operator, text: '>>=' };
          } else {
            return { kind: TokenKind.Operator, text: '>>' };
          }
        } else {
          return { kind: TokenKind.Operator, text: '>' };
        }
      } else if (ch == '<') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (ch1 == '=') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '<=' };
        } else if (ch1 == '<') {
          this.stream.next();
          ch1 = this.stream.peek();
          if (ch1 == '=') {
            this.stream.next();
            return { kind: TokenKind.Operator, text: '<<=' };
          } else {
            return { kind: TokenKind.Operator, text: '<<' };
          }
        } else {
          return { kind: TokenKind.Operator, text: '<' };
        }
      } else if (ch == '=') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (ch1 == '=') {
          this.stream.next();
          let ch1 = this.stream.peek();
          if ((ch1 = '=')) {
            this.stream.next();
            return { kind: TokenKind.Operator, text: '===' };
          } else {
            return { kind: TokenKind.Operator, text: '==' };
          }
        }
        //箭头=>
        else if (ch1 == '>') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '=>' };
        } else {
          return { kind: TokenKind.Operator, text: '=' };
        }
      } else if (ch == '!') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (ch1 == '=') {
          this.stream.next();
          let ch1 = this.stream.peek();
          if ((ch1 = '=')) {
            this.stream.next();
            return { kind: TokenKind.Operator, text: '!==' };
          } else {
            return { kind: TokenKind.Operator, text: '!=' };
          }
        } else {
          return { kind: TokenKind.Operator, text: '!' };
        }
      } else if (ch == '|') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (ch1 == '|') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '||' };
        } else if (ch1 == '=') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '|=' };
        } else {
          return { kind: TokenKind.Operator, text: '|' };
        }
      } else if (ch == '&') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (ch1 == '&') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '&&' };
        } else if (ch1 == '=') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '&=' };
        } else {
          return { kind: TokenKind.Operator, text: '&' };
        }
      } else if (ch == '^') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (ch1 == '=') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '^=' };
        } else {
          return { kind: TokenKind.Operator, text: '^' };
        }
      } else if (ch == '~') {
        this.stream.next();
        return { kind: TokenKind.Operator, text: ch };
      } else {
        //暂时去掉不能识别的字符
        console.log(
          "Unrecognized pattern meeting ': " +
            ch +
            "', at line: " +
            this.stream.line +
            ' col: ' +
            this.stream.col,
        );
        this.stream.next();
        return this.getAToken();
      }
    }
  }

  /**
   * 跳过单行注释
   */
  skipSingleLineComment() {
    //跳过第二个/，第一个之前已经跳过去了。
    this.stream.next();

    //往后一直找到回车或者eof
    while (this.stream.peek() != '\n' && !this.stream.eof()) {
      this.stream.next();
    }
  }

  /**
   * 跳过多行注释
   */
  skipMultipleLineComments() {
    //跳过*，/之前已经跳过去了。
    this.stream.next();

    if (!this.stream.eof()) {
      let ch1 = this.stream.next();
      //往后一直找到回车或者eof
      while (!this.stream.eof()) {
        let ch2 = this.stream.next();
        if (ch1 == '*' && ch2 == '/') {
          return;
        }
        ch1 = ch2;
      }
    }

    //如果没有匹配上，报错。
    console.log(
      "Failed to find matching */ for multiple line comments at ': " +
        this.stream.line +
        ' col: ' +
        this.stream.col,
    );
  }

  /**
   * 跳过空白字符
   */
  skipWhiteSpaces() {
    while (this.isWhiteSpace(this.stream.peek())) {
      this.stream.next();
    }
  }

  /**
   * 字符串字面量。
   * 目前只支持双引号，并且不支持转义。
   */
  parseStringLiteral() {
    let token = { kind: TokenKind.StringLiteral, text: '' };

    //第一个字符不用判断，因为在调用者那里已经判断过了
    this.stream.next();

    while (!this.stream.eof() && this.stream.peek() != '"') {
      token.text += this.stream.next();
    }

    if (this.stream.peek() == '"') {
      //消化掉字符换末尾的引号
      this.stream.next();
    } else {
      console.log(
        'Expecting an " at line: ' +
          this.stream.line +
          ' col: ' +
          this.stream.col,
      );
    }

    return token;
  }

  /**
   * 解析标识符。从标识符中还要挑出关键字。
   */
  parseIdentifer() {
    let token = { kind: TokenKind.Identifier, text: '' };

    //第一个字符不用判断，因为在调用者那里已经判断过了
    token.text += this.stream.next();

    //读入后序字符
    while (
      !this.stream.eof() &&
      this.isLetterDigitOrUnderScore(this.stream.peek())
    ) {
      token.text += this.stream.next();
    }

    //识别出关键字（从字典里查，速度会比较快）
    if (Scanner.KeyWords.has(token.text)) {
      token.kind = TokenKind.Keyword;
    }
    //null
    else if (token.text == 'null') {
      token.kind = TokenKind.NullLiteral;
    }
    //布尔型字面量
    else if (token.text == 'true' || token.text == 'false') {
      token.kind = TokenKind.BooleanLiteral;
    }

    return token;
  }

  isLetterDigitOrUnderScore(ch) {
    return (
      (ch >= 'A' && ch <= 'Z') ||
      (ch >= 'a' && ch <= 'z') ||
      (ch >= '0' && ch <= '9') ||
      ch == '_'
    );
  }

  isLetter(ch) {
    return (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z');
  }

  isDigit(ch) {
    return ch >= '0' && ch <= '9';
  }

  isWhiteSpace(ch) {
    return ch == ' ' || ch == '\n' || ch == '\t';
  }
}
