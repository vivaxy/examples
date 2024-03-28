/**
 * @since 2024-03-28
 * @author vivaxy
 * @source https://gitee.com/richard-gong/craft-a-language/blob/master/01/play.ts
 */
/**
 * 第1节
 * 本节的目的是迅速的实现一个最精简的语言的功能，让你了解一门计算机语言的骨架。
 * 知识点：
 * 1.递归下降的方法做词法分析；
 * 2.语义分析中的引用消解（找到函数的定义）；
 * 3.通过遍历AST的方法，执行程序。
 *
 * 本节采用的语法规则是极其精简的，只能定义函数和调用函数。定义函数的时候，还不能有参数。
 * prog = (functionDecl | functionCall)* ;
 * functionDecl: "function" Identifier "(" ")"  functionBody;
 * functionBody : '{' functionCall* '}' ;
 * functionCall : Identifier '(' parameterList? ')' ;
 * parameterList : StringLiteral (',' StringLiteral)* ;
 */

const TokenKind = {
  Keyword: 'Keyword',
  Identifier: 'Identifier',
  StringLiteral: 'StringLiteral',
  Separator: 'Separator',
  Operator: 'Operator',
  EOF: 'EOF',
};

const tokenArray = [
  { kind: TokenKind.Keyword, text: 'function' },
  { kind: TokenKind.Identifier, text: 'sayHello' },
  { kind: TokenKind.Separator, text: '(' },
  { kind: TokenKind.Separator, text: ')' },
  { kind: TokenKind.Separator, text: '{' },
  { kind: TokenKind.Identifier, text: 'println' },
  { kind: TokenKind.Separator, text: '(' },
  { kind: TokenKind.StringLiteral, text: 'Hello World!' },
  { kind: TokenKind.Separator, text: ')' },
  { kind: TokenKind.Separator, text: ';' },
  { kind: TokenKind.Separator, text: '}' },
  { kind: TokenKind.Identifier, text: 'sayHello' },
  { kind: TokenKind.Separator, text: '(' },
  { kind: TokenKind.Separator, text: ')' },
  { kind: TokenKind.Separator, text: ';' },
  { kind: TokenKind.EOF, text: '' },
];

class Tokenizer {
  constructor(tokens) {
    this.pos = 0;
    this.tokens = tokens;
  }

  position() {
    return this.pos;
  }

  next() {
    if (this.pos <= this.tokens.length) {
      return this.tokens[this.pos++];
    } else {
      // 如果已经到了末尾，总是返回EOF
      return this.tokens[this.pos];
    }
  }

  traceBack(pos) {
    this.pos = pos;
  }
}

class AstNode {}

class Statement extends AstNode {
  static isStatementNode(node) {
    if (!node) {
      return false;
    } else {
      return true;
    }
  }
}

class Program extends AstNode {
  constructor(stmts) {
    super();
    this.stmts = stmts;
  }

  dump(prefix) {
    console.log(prefix + 'Prog');
    this.stmts.forEach((x) => x.dump(prefix + '\t'));
  }
}

class FunctionDecl {
  constructor(name, body) {
    this.name = name;
    this.body = body;
  }

  static isFunctionDecl(node) {
    if (!node) {
      return false;
    }
    return !!node.body;
  }

  dump(prefix) {
    console.log(prefix + 'FunctionDecl ' + this.name);
    this.body.dump(prefix + '\t');
  }
}

class FunctionBody {
  constructor(stmts) {
    this.stmts = stmts;
  }

  static isFunctionBodyNode(node) {
    if (!node) {
      return false;
    }
    if (Object.getPrototypeOf(node) === FunctionBody.prototype) {
      return true;
    } else {
      return false;
    }
  }

  dump(prefix) {
    console.log(prefix + 'FunctionBody');
    this.stmts.forEach((x) => x.dump(prefix + '\t'));
  }
}

class FunctionCall extends Statement {
  constructor(name, parameters) {
    super();
    this.name = name;
    this.parameters = parameters;
    this.definition = null;
  }

  static isFunctionCallNode(node) {
    if (!node) {
      return false;
    }
    if (Object.getPrototypeOf(node) === FunctionCall.prototype) {
      return true;
    } else {
      return false;
    }
  }

  dump(prefix) {
    console.log(
      prefix +
        'FunctionCall ' +
        this.name +
        (this.definition !== null ? ', resolved' : ', not resolved'),
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

  parseProg() {
    const stmts = [];
    let stmt = null;
    while (true) {
      stmt = this.parseFunctionDecl();
      if (stmt) {
        stmts.push(stmt);
        continue;
      }

      stmt = this.parseFunctionCall();
      if (stmt) {
        stmts.push(stmt);
        continue;
      }

      if (!stmt) {
        break;
      }
    }
    return new Program(stmts);
  }

  parseFunctionDecl() {
    let oldPos = this.tokenizer.position();
    let t = this.tokenizer.next();
    if (t.kind === TokenKind.Keyword && t.text === 'function') {
      t = this.tokenizer.next();
      if (t.kind === TokenKind.Identifier) {
        let t1 = this.tokenizer.next();
        if (t1.text === '(') {
          let t2 = this.tokenizer.next();
          if (t2.text === ')') {
            let functionBody = this.parseFunctionBody();
            if (functionBody) {
              return new FunctionDecl(t.text, functionBody);
            }
          } else {
            console.log(`Expecting ')' in FunctionDecl, but got ${t2.text}`);
            return;
          }
        } else {
          console.log(`Expecting '(' in FunctionDecl, but got ${t1.text}`);
          return;
        }
      } else {
        console.log(
          `Expecting FunctionName in FunctionDecl, but got ${t.text}`,
        );
        return;
      }
    }

    this.tokenizer.traceBack(oldPos);
    return null;
  }

  parseFunctionBody() {
    let stmts = [];
    let t = this.tokenizer.next();
    if (t.text === '{') {
      let functionCall = this.parseFunctionCall();
      while (functionCall) {
        stmts.push(functionCall);
        functionCall = this.parseFunctionCall();
      }
      t = this.tokenizer.next();
      if (t.text === '}') {
        return new FunctionBody(stmts);
      } else {
        console.log(`Expecting '}' in FunctionBody, but got ${t.text}`);
        return;
      }
    } else {
      console.log(`Expecting '{' in FunctionBody, but got ${t.text}`);
      return;
    }
  }

  parseFunctionCall() {
    let oldPos = this.tokenizer.position();
    let params = [];
    let t = this.tokenizer.next();
    if (t.kind === TokenKind.Identifier) {
      let t1 = this.tokenizer.next();
      if (t1.text === '(') {
        let t2 = this.tokenizer.next();
        while (t2.text !== ')') {
          if (t2.kind === TokenKind.StringLiteral) {
            params.push(t2.text);
          } else {
            console.log(
              `Expecting parameter in FunctionCall, but got ${t2.text}`,
            );
            return;
          }
          t2 = this.tokenizer.next();
          if (t2.text !== ')') {
            if (t2.text === ',') {
              t2 = this.tokenizer.next();
            } else {
              console.log(
                `Expecting a comma in FunctionCall, but got ${t2.text}`,
              );
              return;
            }
          }
        }
        t2 = this.tokenizer.next();
        if (t2.text === ';') {
          return new FunctionCall(t.text, params);
        } else {
          console.log(
            `Expecting a semicolon in FunctionCall, but got ${t2.text}`,
          );
          return;
        }
      }
    }

    this.tokenizer.traceBack(oldPos);
    return null;
  }
}

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

class RefResolver extends AstVisitor {
  visitProg(prog) {
    this.prog = prog;
    for (let x of prog.stmts) {
      let functionCall = x;
      if (FunctionCall.isFunctionCallNode(functionCall)) {
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
    if (functionDecl !== null) {
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
      if (
        FunctionDecl.isFunctionDecl(functionDecl) &&
        functionDecl.name === name
      ) {
        return functionDecl;
      }
    }
    return null;
  }
}

class Interpreter extends AstVisitor {
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
      // 内置函数
      if (functionCall.parameters.length > 0) {
        console.log(functionCall.parameters[0]);
      } else {
        console.log();
      }
      return 0;
    } else {
      //找到函数定义，继续遍历函数体
      if (functionCall.definition !== null) {
        this.visitFunctionBody(functionCall.definition.body);
      }
    }
  }
}

function compileAndRun() {
  // 词法分析
  let tokenizer = new Tokenizer(tokenArray);
  console.log('\n程序所使用的Token:');
  for (let token of tokenArray) {
    console.log(token);
  }

  // 语法分析
  let prog = new Parser(tokenizer).parseProg();
  console.log('\n语法分析后的AST:');
  prog.dump('');

  // 语义分析
  new RefResolver().visitProg(prog);
  console.log('\n语义分析后的AST，注意自定义函数的调用已被消解:');
  prog.dump('');

  // 运行程序
  console.log('\n运行当前的程序:');
  let retVal = new Interpreter().visitProg(prog);
  console.log('程序返回值：' + retVal);
}

// 运行示例
compileAndRun();
