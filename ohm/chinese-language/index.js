/**
 * @since 20181008 16:01
 * @author vivaxy
 */

const fs = require('fs');
const assert = require('assert').strict;
const ohm = require('ohm-js');
const g = ohm.grammar(fs.readFileSync('arithmetic.ohm'));

// Create an operation that evaluates the expression. An operation always belongs to a Semantics,
// which is a family of related operations and attributes for a particular grammar.
const semantics = g.createSemantics().addOperation('eval', {
  Exp: function(e) {
    return e.eval();
  },
  AddExp: function(e) {
    return e.eval();
  },
  AddExp_plus: function(left, op, right) {
    return left.eval() + right.eval();
  },
  AddExp_minus: function(left, op, right) {
    return left.eval() - right.eval();
  },
  PriExp: function(e) {
    return e.eval();
  },
  PriExp_paren: function(open, exp, close) {
    return exp.eval();
  },
  number: function(chars) {
    return parseInt(this.sourceString, 10);
  },
});

const match = g.match('1 加 左括号 2 减 3 右括号 加 4');
assert.strictEqual(semantics(match).eval(), 4);
