/**
 * @since 2024-04-01
 * @author vivaxy
 */
/**
 * 语法分析器
 * @version 0.2
 * @author 宫文学
 * @license 木兰开源协议
 * @since 2021-06-04
 *
 * 当前特性：
 * 1.简化版的函数声明
 * 2.简化版的函数调用
 * 3.简化版的表达式
 *
 * 当前语法规则：
 * prog = statementList? EOF;
 * statementList = (variableDecl | functionDecl | expressionStatement)+ ;
 * variableDecl : 'let' Identifier typeAnnotation？ ('=' singleExpression) ';';
 * typeAnnotation : ':' typeName;
 * functionDecl: "function" Identifier "(" ")"  functionBody;
 * functionBody : '{' statementList? '}' ;
 * statement: functionDecl | expressionStatement;
 * expressionStatement: expression ';' ;
 * expression: primary (binOP primary)* ;
 * primary: StringLiteral | DecimalLiteral | IntegerLiteral | functionCall | '(' expression ')' ;
 * binOP: '+' | '-' | '*' | '/' | '=' | '+=' | '-=' | '*=' | '/=' | '==' | '!=' | '<=' | '>=' | '<'
 *      | '>' | '&&'| '||'|...;
 * functionCall : Identifier '(' parameterList? ')' ;
 * parameterList : expression (',' expression)* ;
 */

import { TokenKind } from './scanner.js';
import {
  Block,
  Prog,
  VariableDecl,
  FunctionDecl,
  FunctionCall,
  ExpressionStatement,
  Binary,
  IntegerLiteral,
  DecimalLiteral,
  StringLiteral,
  Variable,
} from './ast.js';

////////////////////////////////////////////////////////////////////////////////
//Parser

/**
 * 语法解析器。
 * 通常用parseProg()作为入口，解析整个程序。也可以用下级的某个节点作为入口，只解析一部分语法。
 */
export class Parser {
  constructor(scanner) {
    this.scanner = scanner;
  }

  /**
   * 解析Prog
   * 语法规则：
   * prog = (functionDecl | functionCall)* ;
   */
  parseProg() {
    return new Prog(this.parseStatementList());
  }

  parseStatementList() {
    let stmts = [];
    let t = this.scanner.peek();
    //statementList的Follow集合里有EOF和'}'这两个元素，分别用于prog和functionBody等场景。
    while (t.kind != TokenKind.EOF && t.text != '}') {
      let stmt = this.parseStatement();

      if (stmt != null) {
        stmts.push(stmt);
      } else {
        // console.log("Error parsing a Statement in Programm.");
        // return null;
      }
      t = this.scanner.peek();
    }
    return stmts;
  }

  /**
   * 解析语句。
   * 知识点：在这里，遇到了函数调用、变量声明和变量赋值，都可能是以Identifier开头的情况，所以预读一个Token是不够的，
   * 所以这里预读了两个Token。
   */
  parseStatement() {
    let t = this.scanner.peek();
    if (t.kind == TokenKind.Keyword && t.text == 'function') {
      return this.parseFunctionDecl();
    } else if (t.text == 'let') {
      return this.parseVariableDecl();
    } else if (
      t.kind == TokenKind.Identifier ||
      t.kind == TokenKind.DecimalLiteral ||
      t.kind == TokenKind.IntegerLiteral ||
      t.kind == TokenKind.StringLiteral ||
      t.text == '('
    ) {
      return this.parseExpressionStatement();
    } else {
      debugger;
      console.log(
        'Can not recognize a expression starting with: ' +
          this.scanner.peek().text,
      );
      return null;
    }
  }

  /**
   * 解析变量声明
   * 语法规则：
   * variableDecl : 'let'? Identifier typeAnnotation？ ('=' singleExpression) ';';
   */
  parseVariableDecl() {
    //跳过'let'
    this.scanner.next();

    let t = this.scanner.next();
    if (t.kind == TokenKind.Identifier) {
      let varName = t.text;

      let varType = 'any';
      let init = null;

      let t1 = this.scanner.peek();
      //类型标注
      if (t1.text == ':') {
        this.scanner.next();
        t1 = this.scanner.peek();
        if (t1.kind == TokenKind.Identifier) {
          this.scanner.next();
          varType = t1.text;
          t1 = this.scanner.peek();
        } else {
          console.log('Error parsing type annotation in VariableDecl');
          return null;
        }
      }

      //初始化部分
      if (t1.text == '=') {
        this.scanner.next();
        init = this.parseExpression();
      }

      //分号
      t1 = this.scanner.peek();
      if (t1.text == ';') {
        this.scanner.next();
        return new VariableDecl(varName, varType, init);
      } else {
        console.log(
          'Expecting ; at the end of varaible declaration, while we meet ' +
            t1.text,
        );
        return null;
      }
    } else {
      console.log(
        'Expecting variable name in VariableDecl, while we meet ' + t.text,
      );
      return null;
    }
  }

  /**
   * 解析函数声明
   * 语法规则：
   * functionDecl: "function" Identifier "(" ")"  functionBody;
   * 返回值：
   * null-意味着解析过程出错。
   */
  parseFunctionDecl() {
    //跳过关键字'function'
    this.scanner.next();

    let t = this.scanner.next();
    if (t.kind == TokenKind.Identifier) {
      //读取()
      let t1 = this.scanner.next();
      if (t1.text == '(') {
        let t2 = this.scanner.next();
        if (t2.text == ')') {
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
    let t = this.scanner.peek();
    if (t.text == '{') {
      this.scanner.next();
      let stmts = this.parseStatementList();
      t = this.scanner.next();
      if (t.text == '}') {
        return new Block(stmts);
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
   * 解析表达式语句
   */
  parseExpressionStatement() {
    let exp = this.parseExpression();
    if (exp != null) {
      let t = this.scanner.peek();
      if (t.text == ';') {
        this.scanner.next();
        return new ExpressionStatement(exp);
      } else {
        console.log(
          'Expecting a semicolon at the end of an expresson statement, while we got a ' +
            t.text,
        );
      }
    } else {
      console.log('Error parsing ExpressionStatement');
    }
    return null;
  }

  /**
   * 解析表达式
   */
  parseExpression() {
    return this.parseBinary(0);
  }

  /**
   * 二元运算符的优先级。
   */
  opPrec = new Map([
    ['=', 2],
    ['+=', 2],
    ['-=', 2],
    ['*=', 2],
    ['-=', 2],
    ['%=', 2],
    ['&=', 2],
    ['|=', 2],
    ['^=', 2],
    ['~=', 2],
    ['<<=', 2],
    ['>>=', 2],
    ['>>>=', 2],
    ['||', 4],
    ['&&', 5],
    ['|', 6],
    ['^', 7],
    ['&', 8],
    ['==', 9],
    ['===', 9],
    ['!=', 9],
    ['!==', 9],
    ['>', 10],
    ['>=', 10],
    ['<', 10],
    ['<=', 10],
    ['<<', 11],
    ['>>', 11],
    ['>>>', 11],
    ['+', 12],
    ['-', 12],
    ['*', 13],
    ['/', 13],
    ['%', 13],
  ]);

  getPrec(op) {
    let ret = this.opPrec.get(op);
    if (typeof ret == 'undefined') {
      return -1;
    } else {
      return ret;
    }
  }

  /**
   * 采用运算符优先级算法，解析二元表达式。
   * 这是一个递归算法。一开始，提供的参数是最低优先级，
   *
   * @param prec 当前运算符的优先级
   */
  parseBinary(prec) {
    // console.log("parseBinary : " + prec);
    let exp1 = this.parsePrimary();
    if (exp1 != null) {
      let t = this.scanner.peek();
      let tprec = this.getPrec(t.text);

      //下面这个循环的意思是：只要右边出现的新运算符的优先级更高，
      //那么就把右边出现的作为右子节点。
      /**
       * 对于2+3*5
       * 第一次循环，遇到+号，优先级大于零，所以做一次递归的binary
       * 在递归的binary中，遇到乘号，优先级大于+号，所以形成3*5返回，又变成上一级的右子节点。
       *
       * 反过来，如果是3*5+2
       * 第一次循环还是一样。
       * 在递归中，新的运算符的优先级要小，所以只返回一个5，跟前一个节点形成3*5.
       */

      while (t.kind == TokenKind.Operator && tprec > prec) {
        this.scanner.next(); //跳过运算符
        let exp2 = this.parseBinary(tprec);
        if (exp2 != null) {
          let exp = new Binary(t.text, exp1, exp2);
          exp1 = exp;
          t = this.scanner.peek();
          tprec = this.getPrec(t.text);
        } else {
          console.log(
            'Can not recognize a expression starting with: ' + t.text,
          );
        }
      }
      return exp1;
    } else {
      console.log(
        'Can not recognize a expression starting with: ' +
          this.scanner.peek().text,
      );
      return null;
    }
  }

  /**
   * 解析基础表达式。
   */
  parsePrimary() {
    let t = this.scanner.peek();
    console.log('parsePrimary: ' + t.text);

    //知识点：以Identifier开头，可能是函数调用，也可能是一个变量，所以要再多向后看一个Token，
    //这相当于在局部使用了LL(2)算法。
    if (t.kind == TokenKind.Identifier) {
      if (this.scanner.peek2().text == '(') {
        return this.parseFunctionCall();
      } else {
        this.scanner.next();
        return new Variable(t.text);
      }
    } else if (t.kind == TokenKind.IntegerLiteral) {
      this.scanner.next();
      return new IntegerLiteral(parseInt(t.text));
    } else if (t.kind == TokenKind.DecimalLiteral) {
      this.scanner.next();
      return new DecimalLiteral(parseFloat(t.text));
    } else if (t.kind == TokenKind.StringLiteral) {
      this.scanner.next();
      return new StringLiteral(t.text);
    } else if (t.text == '(') {
      this.scanner.next();
      let exp = this.parseExpression();
      let t1 = this.scanner.peek();
      if (t1.text == ')') {
        this.scanner.next();
        return exp;
      } else {
        console.log(
          "Expecting a ')' at the end of a primary expresson, while we got a " +
            t.text,
        );
        return null;
      }
    } else {
      console.log(
        'Can not recognize a primary expression starting with: ' + t.text,
      );
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
    let t = this.scanner.next();
    if (t.kind == TokenKind.Identifier) {
      let t1 = this.scanner.next();
      if (t1.text == '(') {
        //循环，读出所有参数
        t1 = this.scanner.peek();
        while (t1.text != ')') {
          let exp = this.parseExpression();
          if (exp != null) {
            params.push(exp);
          } else {
            console.log('Error parsing parameter in function call');
            return null;
          }

          t1 = this.scanner.peek();
          if (t1.text != ')') {
            if (t1.text == ',') {
              t1 = this.scanner.next();
            } else {
              console.log(
                'Expecting a comma at the end of a function call, while we got a ' +
                  t1.text,
              );
              return null;
            }
          }
        }

        //消化掉')'
        this.scanner.next();

        return new FunctionCall(t.text, params);
      }
    }

    return null;
  }
}
