/**
 * @since 2022-02-28
 * @author vivaxy
 * @see https://readpaper.com/paper/335169515
 */
const OP_TYPES = {
  INS: 'ins',
  DEL: 'del',
};

class Op {
  constructor(pos, ts) {
    this.pos = pos;
    this.ts = ts;
  }

  transform() {
    throw new Error('Not implemented');
  }
}

class InsOp extends Op {
  constructor(pos, char, ts) {
    super(pos, ts);
    this.type = OP_TYPES.INS;
    this.char = char;
  }

  transform(op) {
    if (op.type === OP_TYPES.INS) {
      return this.transformIns(op);
    } else {
      return this.transformDel(op);
    }
  }

  transformIns(op) {
    if (this.pos < op.pos) return new InsOp(this.pos, this.char, this.ts);
    if (this.pos > op.pos) return new InsOp(this.pos + 1, this.char, this.ts);
    if (this.char === op.char) throw new Error('Id');
    if (this.ts > op.ts) return new InsOp(this.pos + 1, this.char, this.ts);
    return new InsOp(this.pos, this.char, this.ts);
  }

  transformDel(op) {
    if (this.pos < op.pos) return new InsOp(this.pos, this.char, this.ts);
    return new InsOp(this.pos - 1, this.char, this.ts);
  }
}

class DelOp extends Op {
  constructor(pos, ts) {
    super(pos, ts);
    this.type = OP_TYPES.DEL;
  }

  transform(op) {
    if (op.type === OP_TYPES.INS) {
      return this.transformIns(op);
    } else {
      return this.transformDel(op);
    }
  }

  transformIns(op) {
    if (this.pos < op.pos) return new DelOp(this.pos, this.ts);
    return new DelOp(this.pos + 1, this.ts);
  }

  transformDel(op) {
    if (this.pos < op.pos) return new DelOp(this.pos, this.ts);
    if (this.pos > op.pos) return new DelOp(this.pos - 1, this.ts);
    throw new Error('Id');
  }
}

function car(n, op) {
  if (op.type === OP_TYPES.INS) {
    if (n === op.pos) return op.char;
    if (n > op.pos) return car(n - 1);
    return car(n);
  }
  if (n >= op.pos) return car(n + 1);
  return car(n);
}
