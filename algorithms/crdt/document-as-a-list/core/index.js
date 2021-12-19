/**
 * @since 2021-12-19
 * @author vivaxy
 */
class Item {
  constructor(clientId, clock, originLeft, originRight) {
    this.clientId = clientId;
    this.clock = clock;
    this.originLeft = originLeft;
    this.originRight = originRight;
    this.left = null;
    this.right = null;
  }

  get size() {
    throw new Error('Not implemented');
  }
}

class TagItem extends Item {
  constructor(
    clientId,
    clock,
    originLeft,
    originRight,
    isOpeningTag,
    tagName,
    relatedItem,
  ) {
    super(clientId, clock, originLeft, originRight);
    this.isOpeningTag = isOpeningTag;
    this.tagName = tagName;
    this.relatedItem = relatedItem;
  }

  get size() {
    return 1;
  }
}

class StringItem extends Item {
  constructor(clientId, clock, originLeft, originRight, string) {
    super(clientId, clock, originLeft, originRight);
    this.string = string;
  }

  get size() {
    return this.string.length;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  appendItem(item) {
    if (!this.tail) {
      this.head = this.tail = item;
    } else {
      this.tail.right = item;
      this.tail = item;
    }
  }

  appendTo(target, item) {
    item.right = target.right;
    target.right = item;
  }
}

class DoublyLinkedListPosition {
  constructor(doublyLinkedList) {
    this.prev = null;
    this.next = doublyLinkedList.head;
    this.pos = 0;
  }

  backwardItem() {
    if (!this.prev) {
      throw new Error('Leftmost');
    }
    this.pos -= this.prev.size;
    this.next = this.prev;
    this.prev = this.prev.left;
  }

  forwardItem() {
    if (!this.next) {
      throw new Error('Rightmost');
    }
    this.pos += this.next.size;
    this.prev = this.next;
    this.next = this.next.right;
  }

  goToPosition(pos) {
    if (this.pos < pos) {
      while (this.pos < pos) {
        this.forwardItem();
      }
      return this;
    }
    if (this.pos > pos) {
      while (this.pos > pos) {
        this.backwardItem();
      }
      return this;
    }
    return this;
  }
}

class Document {
  constructor() {
    this.clientId = Math.floor(Math.random() * 0xffffff);
    this.clock = 0;
  }

  insert(pos, content) {}
}

/**
 * TODO What content represents the document?
 *
 * 1. The HTML like json. (ProseMirror)
 * 2. The delta. (Quill.js, Etherpad)
 *
 * A document:
 * ```
 * <p>1<bold>2</bold>3</p>
 * <p align="center">4<img src="x" />5</p>
 * <blockquote>
 *   <blockquote>
 *     <table>
 *       <table_row>
 *         <table_cell>
 *           <p>x</p>
 *         </table_cell>
 *       </table_row>
 *     </table>
 *   </blockquote>
 * </blockquote>
 * ```
 *
 * Is represented by
 * 1. same
 * 2.
 *  - 1
 *  - 2, bold
 *  - 3\n
 *  - 4
 *  - img, src=x
 *  - 5
 *  - \n, center
 *  - ???
 */
