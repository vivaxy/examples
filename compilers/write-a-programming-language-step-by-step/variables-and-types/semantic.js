/**
 * @since 2024-04-01
 * @author vivaxy
 */
/**
 * 语义分析功能
 * @version 0.2
 * @author 宫文学
 * @license 木兰开源协议
 * @since 2021-06-04
 *
 * 当前特性：
 * 1.简单的符号表
 * 2.简单的函数消解
 * 3.简单的变量消解
 *
 */

import { AstVisitor } from './ast.js';

/////////////////////////////////////////////////////////////////////////
// 符号表
//

/**
 * 符号表
 * 保存变量、函数、类等的名称和它的类型、声明的位置（AST节点）
 */
export class SymTable {
  table = new Map();

  enter(name, decl, symType) {
    this.table.set(name, new Symbol(name, decl, symType));
  }

  hasSymbol(name) {
    return this.table.has(name);
  }

  /**
   * 根据名称查找符号。
   * @param name 符号名称。
   * @returns 根据名称查到的Symbol。如果没有查到，则返回null。
   */
  getSymbol(name) {
    let item = this.table.get(name);
    if (typeof item == 'object') {
      return item;
    } else {
      return null;
    }
  }
}

/**
 * 符号表条目
 */
class Symbol {
  constructor(name, decl, kind) {
    this.name = name;
    this.decl = decl;
    this.kind = kind;
  }
}

/**
 * 符号类型
 */
export let SymKind;
(function (SymKind) {
  SymKind[(SymKind['Variable'] = 0)] = 'Variable';
  SymKind[(SymKind['Function'] = 1)] = 'Function';
  SymKind[(SymKind['Class'] = 2)] = 'Class';
  SymKind[(SymKind['Interface'] = 3)] = 'Interface';
})(SymKind || (SymKind = {}));

/////////////////////////////////////////////////////////////////////////
// 建立符号表
//

/**
 * 把符号加入符号表。
 */
export class Enter extends AstVisitor {
  constructor(symTable) {
    super();
    this.symTable = symTable;
  }

  /**
   * 把函数声明加入符号表
   * @param functionDecl
   */
  visitFunctionDecl(functionDecl) {
    if (this.symTable.hasSymbol(functionDecl.name)) {
      console.log('Dumplicate symbol: ' + functionDecl.name);
    }
    this.symTable.enter(functionDecl.name, functionDecl, SymKind.Function);
  }

  /**
   * 把变量声明加入符号表
   * @param variableDecl
   */
  visitVariableDecl(variableDecl) {
    if (this.symTable.hasSymbol(variableDecl.name)) {
      console.log('Dumplicate symbol: ' + variableDecl.name);
    }
    this.symTable.enter(variableDecl.name, variableDecl, SymKind.Variable);
  }
}

/////////////////////////////////////////////////////////////////////////
// 引用消解
// 1.函数引用消解
// 2.变量应用消解

/**
 * 引用消解
 * 遍历AST。如果发现函数调用和变量引用，就去找它的定义。
 */
export class RefResolver extends AstVisitor {
  constructor(symTable) {
    super();
    this.symTable = symTable;
  }

  //消解函数引用
  visitFunctionCall(functionCall) {
    let symbol = this.symTable.getSymbol(functionCall.name);
    if (symbol != null && symbol.kind == SymKind.Function) {
      functionCall.decl = symbol.decl;
    } else {
      if (functionCall.name != 'println') {
        //系统内置函数不用报错
        console.log(
          'Error: cannot find declaration of function ' + functionCall.name,
        );
      }
    }
  }

  //消解变量引用
  visitVariable(variable) {
    let symbol = this.symTable.getSymbol(variable.name);
    if (symbol != null && symbol.kind == SymKind.Variable) {
      variable.decl = symbol.decl;
    } else {
      console.log(
        'Error: cannot find declaration of variable ' + variable.name,
      );
    }
  }
}
