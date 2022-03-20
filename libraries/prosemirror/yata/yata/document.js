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
    this.forwardToDeletionEnd();
    this.forwardItem();
    this.forwardToDeletionEnd();
  }

  forwardItem() {
    this.left = this.right;
    this.right = this.right.right;
    if (!this.left.deleted) {
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

  forwardToDeletionEnd() {
    while (this.right && this.right.deleted) {
      this.forwardItem();
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
      $pos.forwardToDeletionEnd();
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
      if (item.openingTagItem && !items.includes(item.openingTagItem)) {
        // this is a closing item, and its corresponding opening item is not newly integrated
        item.openingTagItem.replaceWithClosingTagItem(item);
      }
      if (item.closingTagItem && !items.includes(item.closingTagItem)) {
        // this is an opening item, and its corresponding closing item is not newly integrated
        item.closingTagItem.replaceWithOpeningTagItem(item);
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

  toHTMLString() {
    let item = this.head;
    let output = '';
    while (item) {
      output += item.toHTMLString();
      item = item.right;
    }
    return output;
  }

  toArray() {
    const output = [];
    let item = this.head;
    while (item) {
      output.push(item);
      item = item.right;
    }
    return output;
  }
}
