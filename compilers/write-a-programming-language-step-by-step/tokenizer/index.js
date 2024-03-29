/**
 * @since 2024-03-29
 * @author vivaxy
 * @source https://gitee.com/richard-gong/craft-a-language/blob/master/02/play.ts
 */
/**
 * 第2节
 * 本节的知识点有两个：
 * 1.学会词法分析；
 * 2.升级语法分析为LL算法，因此需要知道如何使用First和Follow集合。
 *
 * 本节采用的词法规则是比较精简的，比如不考虑Unicode。
 * Identifier: [a-zA-Z_][a-zA-Z0-9_]* ;
 */

/////////////////////////////////////////////////////////////////////////
// 词法分析
// 本节没有提供词法分析器，直接提供了一个Token串。语法分析程序可以从Token串中依次读出
// 一个个Token，也可以重新定位Token串的当前读取位置。

//Token的类型
const TokenKind = {
  Keyword: 'Keyword',
  Identifier: 'Identifier',
  StringLiteral: 'StringLiteral',
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
class CharStream {
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
 * peek(): 返回当前的Token，但不移动当前位置。
 */
class Tokenizer {
  nextToken = { kind: TokenKind.EOF, text: '' };

  constructor(stream) {
    this.stream = stream;
  }

  next() {
    //在第一次的时候，先parse一个Token
    if (this.nextToken.kind === TokenKind.EOF && !this.stream.eof()) {
      this.nextToken = this.getAToken();
    }
    let lastToken = this.nextToken;

    //往前走一个Token
    this.nextToken = this.getAToken();
    return lastToken;
  }

  peek() {
    if (this.nextToken.kind === TokenKind.EOF && !this.stream.eof()) {
      this.nextToken = this.getAToken();
    }
    return this.nextToken;
  }

  //从字符串流中获取一个新Token。
  getAToken() {
    this.skipWhiteSpaces();
    if (this.stream.eof()) {
      return { kind: TokenKind.EOF, text: '' };
    } else {
      let ch = this.stream.peek();
      if (this.isLetter(ch) || this.isDigit(ch)) {
        return this.parseIdentifier();
      } else if (ch === '"') {
        return this.parseStringLiteral();
      } else if (
        ch === '(' ||
        ch === ')' ||
        ch === '{' ||
        ch === '}' ||
        ch === ';' ||
        ch === ','
      ) {
        this.stream.next();
        return { kind: TokenKind.Separator, text: ch };
      } else if (ch === '/') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (ch1 === '*') {
          this.skipMultipleLineComments();
          return this.getAToken();
        } else if (ch1 === '/') {
          this.skipSingleLineComment();
          return this.getAToken();
        } else if (ch1 === '=') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '/=' };
        } else {
          return { kind: TokenKind.Operator, text: '/' };
        }
      } else if (ch === '+') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (ch1 === '+') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '++' };
        } else if (ch1 === '=') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '+=' };
        } else {
          return { kind: TokenKind.Operator, text: '+' };
        }
      } else if (ch === '-') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (ch1 === '-') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '--' };
        } else if (ch1 === '=') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '-=' };
        } else {
          return { kind: TokenKind.Operator, text: '-' };
        }
      } else if (ch === '*') {
        this.stream.next();
        let ch1 = this.stream.peek();
        if (ch1 === '=') {
          this.stream.next();
          return { kind: TokenKind.Operator, text: '*=' };
        } else {
          return { kind: TokenKind.Operator, text: '*' };
        }
      } else {
        //暂时去掉不能识别的字符
        console.log(
          "Unrecognized pattern meeting ': " +
            ch +
            "', at" +
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
    while (this.stream.peek() !== '\n' && !this.stream.eof()) {
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
        if (ch1 === '*' && ch2 === '/') {
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

    while (!this.stream.eof() && this.stream.peek() !== '"') {
      token.text += this.stream.next();
    }

    if (this.stream.peek() === '"') {
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
  parseIdentifier() {
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

    //识别出关键字
    if (token.text === 'function') {
      token.kind = TokenKind.Keyword;
    }

    return token;
  }

  isLetterDigitOrUnderScore(ch) {
    return (
      (ch >= 'A' && ch <= 'Z') ||
      (ch >= 'a' && ch <= 'z') ||
      (ch >= '0' && ch <= '9') ||
      ch === '_'
    );
  }

  isLetter(ch) {
    return (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z');
  }

  isDigit(ch) {
    return ch >= '0' && ch <= '9';
  }

  isWhiteSpace(ch) {
    return ch === ' ' || ch === '\n' || ch === '\t';
  }
}

/////////////////////////////////////////////////////////////////////////
// 语法分析
// 包括了AST的数据结构和递归下降的语法解析程序
class AstNode {}

/**
 * 语句
 * 其子类包括函数声明和函数调用
 */
class Statement extends AstNode {}

/**
 * 程序节点，也是AST的根节点
 */
class Prog extends AstNode {
  stmts = []; //程序中可以包含多个语句
  constructor(stmts) {
    super();
    this.stmts = stmts;
  }

  dump(prefix) {
    console.log(prefix + 'Prog');
    this.stmts.forEach((x) => x.dump(prefix + '\t'));
  }
}

/**
 * 函数声明节点
 */
class FunctionDecl extends Statement {
  constructor(name, body) {
    super();
    this.name = name; //函数名称
    this.body = body; //函数体
  }

  dump(prefix) {
    console.log(prefix + 'FunctionDecl ' + this.name);
    this.body.dump(prefix + '\t');
  }
}

/**
 * 函数体
 */
class FunctionBody extends AstNode {
  constructor(stmts) {
    super();
    this.stmts = stmts;
  }

  dump(prefix) {
    console.log(prefix + 'FunctionBody');
    this.stmts.forEach((x) => x.dump(prefix + '\t'));
  }
}

/**
 * 函数调用
 */
class FunctionCall extends Statement {
  definition = null; //指向函数的声明
  constructor(name, parameters) {
    super();
    this.name = name;
    this.parameters = parameters;
  }

  dump(prefix) {
    console.log(
      prefix +
        'FunctionCall ' +
        this.name +
        (this.definition != null ? ', resolved' : ', not resolved'),
    );
    this.parameters.forEach((x) =>
      console.log(prefix + '\t' + 'Parameter: ' + x),
    );
  }
}

class Parser {
  constructor(tokenizer) {
    this.tokenizer = tokenizer;
  }

  /**
   * 解析Prog
   * 语法规则：
   * prog = (functionDecl | functionCall)* ;
   */
  parseProg() {
    let stmts = [];
    let stmt = null;
    let token = this.tokenizer.peek();

    while (token.kind !== TokenKind.EOF) {
      if (token.kind === TokenKind.Keyword && token.text === 'function') {
        stmt = this.parseFunctionDecl();
      } else if (token.kind === TokenKind.Identifier) {
        stmt = this.parseFunctionCall();
      }

      if (stmt != null) {
        stmts.push(stmt);
        console.log('success');
      } else {
        //console.log("Unrecognized token: ");
        // console.log(token);
      }
      token = this.tokenizer.peek();
    }
    return new Prog(stmts);
  }

  /**
   * 解析函数声明
   * 语法规则：
   * functionDecl: "function" Identifier "(" ")"  functionBody;
   * 返回值：
   * null-意味着解析过程出错。
   */
  parseFunctionDecl() {
    console.log('in FunctionDecl');
    //跳过关键字'function'
    this.tokenizer.next();

    let t = this.tokenizer.next();
    if (t.kind === TokenKind.Identifier) {
      //读取()
      let t1 = this.tokenizer.next();
      if (t1.text === '(') {
        let t2 = this.tokenizer.next();
        if (t2.text === ')') {
          let functionBody = this.parseFunctionBody();
          if (functionBody != null) {
            //如果解析成功，从这里返回
            return new FunctionDecl(t.text, functionBody);
          } else {
            console.log('Error parsing FunctionBody in FunctionDecl');
            return null;
          }
        } else {
          console.log(
            "Expecting ')' in FunctionDecl, while we got a " + t.text,
          );
          return null;
        }
      } else {
        console.log("Expecting '(' in FunctionDecl, while we got a " + t.text);
        return null;
      }
    } else {
      console.log('Expecting a function name, while we got a ' + t.text);
      return null;
    }

    return null;
  }

  /**
   * 解析函数体
   * 语法规则：
   * functionBody : '{' functionCall* '}' ;
   */
  parseFunctionBody() {
    let stmts = [];
    let t = this.tokenizer.next();
    if (t.text === '{') {
      while (this.tokenizer.peek().kind === TokenKind.Identifier) {
        let functionCall = this.parseFunctionCall();
        if (functionCall != null) {
          stmts.push(functionCall);
        } else {
          console.log('Error parsing a FunctionCall in FunctionBody.');
          return null;
        }
      }
      t = this.tokenizer.next();
      if (t.text === '}') {
        return new FunctionBody(stmts);
      } else {
        console.log("Expecting '}' in FunctionBody, while we got a " + t.text);
        return null;
      }
    } else {
      console.log("Expecting '{' in FunctionBody, while we got a " + t.text);
      return null;
    }
  }

  /**
   * 解析函数调用
   * 语法规则：
   * functionCall : Identifier '(' parameterList? ')' ;
   * parameterList : StringLiteral (',' StringLiteral)* ;
   */
  parseFunctionCall() {
    let params = [];
    let t = this.tokenizer.next();
    if (t.kind === TokenKind.Identifier) {
      let t1 = this.tokenizer.next();
      if (t1.text === '(') {
        let t2 = this.tokenizer.next();
        //循环，读出所有参数
        while (t2.text !== ')') {
          if (t2.kind === TokenKind.StringLiteral) {
            params.push(t2.text);
          } else {
            console.log(
              'Expecting parameter in FunctionCall, while we got a ' + t2.text,
            );
            return null;
          }
          t2 = this.tokenizer.next();
          if (t2.text !== ')') {
            if (t2.text === ',') {
              t2 = this.tokenizer.next();
            } else {
              console.log(
                'Expecting a comma in FunctionCall, while we got a ' + t2.text,
              );
              return null;
            }
          }
        }
        //消化掉一个分号：;
        t2 = this.tokenizer.next();
        if (t2.text === ';') {
          return new FunctionCall(t.text, params);
        } else {
          console.log(
            'Expecting a semicolon in FunctionCall, while we got a ' + t2.text,
          );
          return null;
        }
      }
    }

    return null;
  }
}

/**
 * 对AST做遍历的Vistor。
 * 这是一个基类，定义了缺省的遍历方式。子类可以覆盖某些方法，修改遍历方式。
 */
class AstVisitor {
  visitProg(prog) {
    let retVal;
    for (let x of prog.stmts) {
      if (typeof x.body === 'object') {
        retVal = this.visitFunctionDecl(x);
      } else {
        retVal = this.visitFunctionCall(x);
      }
    }
    return retVal;
  }

  visitFunctionDecl(functionDecl) {
    return this.visitFunctionBody(functionDecl.body);
  }

  visitFunctionBody(functionBody) {
    let retVal;
    for (let x of functionBody.stmts) {
      retVal = this.visitFunctionCall(x);
    }
    return retVal;
  }

  visitFunctionCall(functionCall) {
    return undefined;
  }
}

/////////////////////////////////////////////////////////////////////////
// 语义分析
// 对函数调用做引用消解，也就是找到函数的声明。

/**
 * 遍历AST。如果发现函数调用，就去找它的定义。
 */
class RefResolver extends AstVisitor {
  prog = null;

  visitProg(prog) {
    this.prog = prog;
    for (let x of prog.stmts) {
      let functionCall = x;
      if (typeof functionCall.parameters === 'object') {
        this.resolveFunctionCall(prog, functionCall);
      } else {
        this.visitFunctionDecl(x);
      }
    }
  }

  visitFunctionBody(functionBody) {
    if (this.prog !== null) {
      for (let x of functionBody.stmts) {
        return this.resolveFunctionCall(this.prog, x);
      }
    }
  }

  resolveFunctionCall(prog, functionCall) {
    let functionDecl = this.findFunctionDecl(prog, functionCall.name);
    if (functionDecl != null) {
      functionCall.definition = functionDecl;
    } else {
      if (functionCall.name !== 'println') {
        //系统内置函数不用报错
        console.log(
          'Error: cannot find definition of function ' + functionCall.name,
        );
      }
    }
  }

  findFunctionDecl(prog, name) {
    for (let x of prog?.stmts) {
      let functionDecl = x;
      if (typeof functionDecl.body === 'object' && functionDecl.name === name) {
        return functionDecl;
      }
    }
    return null;
  }
}

/////////////////////////////////////////////////////////////////////////
// 解释器

/**
 * 遍历AST，执行函数调用。
 */
class Intepretor extends AstVisitor {
  visitProg(prog) {
    let retVal;
    for (let x of prog.stmts) {
      let functionCall = x;
      if (typeof functionCall.parameters === 'object') {
        retVal = this.runFunction(functionCall);
      }
    }
    return retVal;
  }

  visitFunctionBody(functionBody) {
    let retVal;
    for (let x of functionBody.stmts) {
      retVal = this.runFunction(x);
    }
  }

  runFunction(functionCall) {
    if (functionCall.name === 'println') {
      //内置函数
      if (functionCall.parameters.length > 0) {
        console.log(functionCall.parameters[0]);
      } else {
        console.log();
      }
      return 0;
    } else {
      //找到函数定义，继续遍历函数体
      if (functionCall.definition != null) {
        this.visitFunctionBody(functionCall.definition.body);
      }
    }
  }
}

/////////////////////////////////////////////////////////////////////////
// 主程序

function compileAndRun(program) {
  //源代码
  console.log('源代码:');
  console.log(program);

  //词法分析
  console.log('\n词法分析结果:');
  let tokenizer = new Tokenizer(new CharStream(program));
  while (tokenizer.peek().kind !== TokenKind.EOF) {
    console.log(tokenizer.next());
  }
  tokenizer = new Tokenizer(new CharStream(program)); //重置tokenizer,回到开头。

  //语法分析
  let prog = new Parser(tokenizer).parseProg();
  console.log('\n语法分析后的AST:');
  prog.dump('');

  //语义分析
  new RefResolver().visitProg(prog);
  console.log('\n语法分析后的AST，注意自定义函数的调用已被消解:');
  prog.dump('');

  //运行程序
  console.log('\n运行当前的程序:');
  let retVal = new Intepretor().visitProg(prog);
  console.log('程序返回值：' + retVal);
}

compileAndRun(`function sayHello() {
  println("Hello World!");
}

sayHello();
`);
