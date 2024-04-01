/**
 * @since 2024-04-01
 * @author vivaxy
 */
/**
 * 第4节
 * 知识点：
 * 1.语法分析：变量声明和变量赋值
 * 2.符号表
 * 3.变量的引用消解
 * 4.解释器：变量的存取
 * 5.左值
 */

import { TokenKind, Scanner, CharStream } from './scanner.js';
import { AstVisitor } from './ast.js';
import { Parser } from './parser.js';
import { SymTable, Enter, RefResolver } from './semantic.js';

/////////////////////////////////////////////////////////////////////////
// 解释器

/**
 * 遍历AST，并执行。
 */
class Intepretor extends AstVisitor {
  //存储变量值的区域
  values = new Map();

  //函数声明不做任何事情。
  visitFunctionDecl(functionDecl) {}

  /**
   * 运行函数调用。
   * 原理：根据函数定义，执行其函数体。
   * @param functionCall
   */
  visitFunctionCall(functionCall) {
    // console.log("running funciton:" + functionCall.name);
    if (functionCall.name == 'println') {
      //内置函数
      if (functionCall.parameters.length > 0) {
        let retVal = this.visit(functionCall.parameters[0]);
        if (typeof retVal.variable == 'object') {
          retVal = this.getVariableValue(retVal.variable.name);
        }
        console.log(retVal);
      } else {
        console.log();
      }
      return 0;
    } else {
      //找到函数定义，继续遍历函数体
      if (functionCall.decl != null) {
        this.visitBlock(functionCall.decl.body);
      }
    }
  }

  /**
   * 变量声明
   * 如果存在变量初始化部分，要存下变量值。
   * @param functionDecl
   */
  visitVariableDecl(variableDecl) {
    if (variableDecl.init != null) {
      let v = this.visit(variableDecl.init);
      if (this.isLeftValue(v)) {
        v = this.getVariableValue(v.variable.name);
      }
      this.setVariableValue(variableDecl.name, v);
      return v;
    }
  }

  /**
   * 获取变量的值。
   * 这里给出的是左值。左值既可以赋值（写），又可以获取当前值（读）。
   * @param v
   */
  visitVariable(v) {
    return new LeftValue(v);
  }

  getVariableValue(varName) {
    return this.values.get(varName);
  }

  setVariableValue(varName, value) {
    return this.values.set(varName, value);
  }

  isLeftValue(v) {
    return typeof v.variable == 'object';
  }

  visitBinary(bi) {
    // console.log("visitBinary:" + bi.op);
    let ret;
    let v1 = this.visit(bi.exp1);
    let v2 = this.visit(bi.exp2);
    let v1left = null;
    let v2left = null;
    if (this.isLeftValue(v1)) {
      v1left = v1;
      v1 = this.getVariableValue(v1left.variable.name);
      console.log('value of ' + v1left.variable.name + ' : ' + v1);
    }
    if (this.isLeftValue(v2)) {
      v2left = v2;
      v2 = this.getVariableValue(v2left.variable.name);
    }
    switch (bi.op) {
      case '+':
        ret = v1 + v2;
        break;
      case '-':
        ret = v1 - v2;
        break;
      case '*':
        ret = v1 * v2;
        break;
      case '/':
        ret = v1 / v2;
        break;
      case '%':
        ret = v1 % v2;
        break;
      case '>':
        ret = v1 > v2;
        break;
      case '>=':
        ret = v1 >= v2;
        break;
      case '<':
        ret = v1 < v2;
        break;
      case '<=':
        ret = v1 <= v2;
      case '&&':
        ret = v1 && v2;
        break;
      case '||':
        ret = v1 || v2;
        break;
      case '=':
        if (v1left != null) {
          this.setVariableValue(v1left.variable.name, v2);
        } else {
          console.log('Assignment need a left value: ');
        }
        break;
      default:
        console.log('Unsupported binary operation: ' + bi.op);
    }
    return ret;
  }
}

/**
 * 左值。
 * 目前先只是指变量。
 */
class LeftValue {
  constructor(variable) {
    this.variable = variable;
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
  let tokenizer = new Scanner(new CharStream(program));
  while (tokenizer.peek().kind != TokenKind.EOF) {
    console.log(tokenizer.next());
  }
  tokenizer = new Scanner(new CharStream(program)); //重置tokenizer,回到开头。

  //语法分析
  let prog = new Parser(tokenizer).parseProg();
  console.log('\n语法分析后的AST:');
  prog.dump('');

  //语义分析
  let symTable = new SymTable();
  new Enter(symTable).visit(prog); //建立符号表
  new RefResolver(symTable).visit(prog); //引用消解
  console.log('\n语义分析后的AST，注意变量和函数已被消解:');
  prog.dump('');

  //运行程序
  console.log('\n运行当前的程序:');
  let retVal = new Intepretor().visit(prog);
  console.log('程序返回值：' + retVal);
}

const data = `
// line comment
/*
multiline comment
 */

let a: number = 1;
let b: number = 1.25;
let e: string = 'string';
println(a + b, e);
`;

compileAndRun(data);
