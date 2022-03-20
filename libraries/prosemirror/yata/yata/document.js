/**
 * @since 2022-03-12
 * @author vivaxy
 */
import { ReplaceStep } from 'prosemirror-transform';
import { ClosingTagItem, OpeningTagItem, sliceToItems } from './item.js';

export class Position {
  constructor(doc) {
    this.doc = doc;
    this.pos = 0;
    this.left = null;
    this.right = doc.head;
    this.paths = [];
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
    if (this.left instanceof OpeningTagItem) {
      this.paths.push(this.left);
    }
    if (this.right instanceof ClosingTagItem) {
      console.assert(
        this.right.tagName === this.paths[this.paths.length - 1].tagName,
      );
      this.paths.pop();
    }
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
      const item = $pos.right;
      item.delete();
      currentPos++;
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (i === 0 && !this.head) {
        this.head = item;
      }
      item.integrate($pos);
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.openingItem && !items.includes(item.openingItem)) {
        // this is a closing item, and its corresponding opening item is not newly integrated
        item.openingItem.replaceWithClosingItem(item);
      }
      if (item.closingItem && items.includes(item.closingItem)) {
        // this is an opening item, and its corresponding closing item is not newly integrated
        item.closingItem.replaceWithOpengingItem(item);
      }
    }
  }

  resolvePosition(value) {
    const pos = new Position(this);
    while (pos.pos < value) {
      pos.forward();
    }
    return pos;
  }

  applyStep(step) {
    if (step instanceof ReplaceStep) {
      this.applyReplaceStep(step);
    }
  }

  applyReplaceStep(step) {
    this.replaceItems(step.from, step.to, sliceToItems(step.slice));
  }

  applyItems() {
    // TODO
  }
}
