/**
 * @since 2022-03-12
 * @author vivaxy
 */
export class Position {
  constructor(doc) {
    this.doc = doc;
    this.pos = 0;
    this.left = null;
    this.right = doc.head;
  }

  canForward() {
    return this.right;
  }

  forward() {
    if (!this.canForward()) {
      throw new Error('Unexpected position ' + (this.pos + 1));
    }
    this.left = this.right;
    this.right = this.right.right;
    this.pos += 1;
  }
}

export class Document {
  constructor() {
    this.head = null;
    this.client = Math.random().toString(36).slice(2);
    this.clock = 0;
  }

  /**
   * @param from
   * @param to
   * @param items
   */
  replaceItems(from, to, items) {
    const $pos = this.resolvePosition(from);
    let currentPos = from;
    while (currentPos < to) {
      console.assert($pos.right, 'Unexpected position ' + to);
      $pos.right.delete();
      currentPos++;
    }
    for (let i = 0; i < items.length; i++) {
      if (i === 0 && !this.head) {
        this.head = items[i];
      }
      items[i].integrate($pos);
    }
  }

  resolvePosition(value) {
    const pos = new Position(this);
    while (pos.pos < value) {
      pos.forward();
    }
    return pos;
  }
}
