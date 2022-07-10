/**
 * @since 2022-03-12
 * @author vivaxy
 */
import {
  AddMarkStep,
  RemoveMarkStep,
  ReplaceStep,
  ReplaceAroundStep,
} from 'prosemirror-transform';
import {
  ClosingTagItem,
  OpeningTagItem,
  sliceToItems,
  fragmentToItems,
} from './item.js';

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
    if (!this.canForward()) {
      throw new Error(`Unexpected position ${this.pos + 1}`);
    }
    this.left = this.right;
    this.right = this.right.right;
    if (!this.left.deleted) {
      this.pos += 1;
      if (this.left instanceof OpeningTagItem) {
        this.paths.push(this.left);
      }
      if (this.left instanceof ClosingTagItem) {
        console.assert(
          this.left.tagName === this.paths[this.paths.length - 1].tagName,
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
  static fromNodes(nodes) {
    const doc = new Document();
    const items = fragmentToItems(nodes);
    const pos = new Position(doc);
    items.forEach(function (item) {
      item.integrate(pos);
    });
    return doc;
  }

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
    this.replaceItemsInner(from, to, items);
    this.updatePairedTagsAfterReplace(items);
  }

  replaceAroundItems(from, to, gapFrom, gapTo, items, insert) {
    this.replaceItemsInner(gapTo, to, items.slice(insert));
    this.replaceItemsInner(from, gapFrom, items.slice(0, insert));
    this.updatePairedTagsAfterReplace(items);
  }

  replaceItemsInner(from, to, items) {
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
  }

  updatePairedTagsAfterReplace(items) {
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
    } else if (step instanceof ReplaceAroundStep) {
      this.applyReplaceAroundStep(step);
    } else if (step instanceof AddMarkStep) {
      this.applyAddMarkStep(step);
    } else if (step instanceof RemoveMarkStep) {
      this.applyRemoveMarkStep(step);
    } else {
      throw new Error('Unexpected step');
    }
  }

  applyReplaceStep(step) {
    this.replaceItems(step.from, step.to, sliceToItems(step.slice));
  }

  applyReplaceAroundStep(step) {
    this.replaceAroundItems(
      step.from,
      step.to,
      step.gapFrom,
      step.gapTo,
      sliceToItems(step.slice),
      step.insert,
    );
  }

  applyAddMarkStep(step) {
    // TODO
  }

  applyRemoveMarkStep(step) {
    // TODO
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
