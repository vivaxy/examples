import type { Fragment, Schema, Node } from 'prosemirror-model';
import type {
  Step,
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
  itemsToSlice,
  Item,
} from './item.js';
import type { ItemID, ClientMap, ItemReference } from './types.js';

export class Position {
  doc: Document;
  pos: number;
  left: Item | null;
  right: Item | null;
  paths: OpeningTagItem[];

  constructor(doc: Document) {
    this.doc = doc;
    this.pos = 0;
    this.left = null;
    this.right = doc.head;
    this.paths = [];
  }

  canForward(): boolean {
    return this.right !== null;
  }

  forward(): void {
    this.forwardToDeletionEnd();
    this.forwardItem();
    this.forwardToDeletionEnd();
  }

  forwardItem(): void {
    if (!this.canForward()) {
      throw new Error(`Unexpected position ${this.pos + 1}`);
    }
    this.left = this.right;
    this.right = this.right!.right;
    if (!this.left!.deleted) {
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

  forwardToDeletionEnd(): void {
    while (this.right && this.right.deleted) {
      this.forwardItem();
    }
  }
}

export class Document {
  head: Item | null;
  client: string;
  clock: number;

  static fromNodes(nodes: Fragment): Document {
    const doc = new Document();
    const items = fragmentToItems(nodes);
    const pos = new Position(doc);
    items.forEach(function (item) {
      item.integrate(pos);
    });
    return doc;
  }

  constructor(client: string = Math.random().toString(36).slice(2)) {
    this.head = null;
    this.client = client;
    this.clock = 0;
  }

  /**
   * @param from
   * @param to
   * @param items
   */
  replaceItems(from: number, to: number, items: Item[]): void {
    this.replaceItemsInner(from, to, items);
    this.updatePairedTagsAfterReplace(items);
  }

  replaceAroundItems(
    from: number,
    to: number,
    gapFrom: number,
    gapTo: number,
    items: Item[],
    insert: number,
  ): void {
    this.replaceItemsInner(gapTo, to, items.slice(insert));
    this.replaceItemsInner(from, gapFrom, items.slice(0, insert));
    this.updatePairedTagsAfterReplace(items);
  }

  replaceItemsInner(from: number, to: number, items: Item[]): void {
    const $pos = this.resolvePosition(from);
    let currentPos = from;
    while (currentPos < to) {
      console.assert($pos.right, 'Unexpected position ' + to);
      const item = $pos.right!;
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

  updatePairedTagsAfterReplace(items: Item[]): void {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (
        item instanceof ClosingTagItem &&
        item.openingTagItem &&
        'integrate' in item.openingTagItem &&
        !items.includes(item.openingTagItem)
      ) {
        // this is a closing item, and its corresponding opening item is not newly integrated
        item.openingTagItem.replaceWithClosingTagItem(this, item);
      }
      if (
        item instanceof OpeningTagItem &&
        item.closingTagItem &&
        'integrate' in item.closingTagItem &&
        !items.includes(item.closingTagItem)
      ) {
        // this is an opening item, and its corresponding closing item is not newly integrated
        item.closingTagItem.replaceWithOpeningTagItem(this, item);
      }
    }
  }

  resolvePosition(value: number = 0): Position {
    const pos = new Position(this);
    while (pos.pos < value) {
      pos.forward();
    }
    return pos;
  }

  applyStep(step: Step): void {
    if ('slice' in step && 'from' in step && 'to' in step) {
      if ('gapFrom' in step && 'gapTo' in step && 'insert' in step) {
        this.applyReplaceAroundStep(step as ReplaceAroundStep);
      } else {
        this.applyReplaceStep(step as ReplaceStep);
      }
    } else if ('mark' in step) {
      throw new Error('Mark steps are not implemented');
    } else {
      throw new Error('Unexpected step');
    }
  }

  applyReplaceStep(step: ReplaceStep): void {
    this.replaceItems(step.from, step.to, sliceToItems(step.slice));
  }

  applyReplaceAroundStep(step: ReplaceAroundStep): void {
    this.replaceAroundItems(
      step.from,
      step.to,
      step.gapFrom,
      step.gapTo,
      sliceToItems(step.slice),
      step.insert,
    );
  }

  applyAddMarkStep(_step: AddMarkStep): void {
    throw new Error('applyAddMarkStep is not implemented');
  }

  applyRemoveMarkStep(_step: RemoveMarkStep): void {
    throw new Error('applyRemoveMarkStep is not implemented');
  }

  toHTMLString(): string {
    let item = this.head;
    let output = '';
    while (item) {
      output += item.toHTMLString();
      item = item.right;
    }
    return output;
  }

  toArray(): Item[] {
    const output: Item[] = [];
    let item = this.head;
    while (item) {
      output.push(item);
      item = item.right;
    }
    return output;
  }

  toItems(): ClientMap {
    const clientMap: ClientMap = {};
    const items = this.toArray();
    items.forEach(function (item) {
      if (!clientMap[item.id!.client]) {
        clientMap[item.id!.client] = [];
      }
      clientMap[item.id!.client].push(item.toJSON());
    });
    Object.keys(clientMap).forEach(function (client) {
      clientMap[client] = clientMap[client].sort(function (a, b) {
        return a.id.clock - b.id.clock;
      });
    });
    return clientMap;
  }

  applyItems(clientMap: ClientMap): void {
    // First pass: integrate all items into the document
    Object.keys(clientMap).forEach((client) => {
      const items = clientMap[client];
      items.forEach((itemJSON) => {
        const item = Item.fromJSON(itemJSON);
        item.putIntoDocument(this);
      });
    });

    // Second pass: restore tag pair references
    // After all items are integrated, fix OpeningTagItem/ClosingTagItem references
    // that were serialized as ID objects
    let item = this.head;
    while (item) {
      if (item instanceof OpeningTagItem && item.closingTagItem) {
        // If closingTagItem is an ID object, find the actual item
        if (
          'client' in item.closingTagItem &&
          'clock' in item.closingTagItem &&
          !('integrate' in item.closingTagItem)
        ) {
          const closingPos = this.findItemById(item.closingTagItem as ItemID);
          if (closingPos && closingPos.right) {
            item.closingTagItem = closingPos.right as ClosingTagItem;
          }
        }
      }
      if (item instanceof ClosingTagItem && item.openingTagItem) {
        // If openingTagItem is an ID object, find the actual item
        if (
          'client' in item.openingTagItem &&
          'clock' in item.openingTagItem &&
          !('integrate' in item.openingTagItem)
        ) {
          const openingPos = this.findItemById(item.openingTagItem as ItemID);
          if (openingPos && openingPos.right) {
            item.openingTagItem = openingPos.right as OpeningTagItem;
          }
        }
      }
      item = item.right;
    }

    // todo translate into prosemirror steps
  }

  findItemById(id: ItemID | ItemReference<Item>): Position | null {
    if (!id) {
      return null;
    }
    // Handle case where id might already be an Item with an id property
    const targetId = 'id' in id && id.id ? id.id : (id as ItemID);

    const pos = new Position(this);
    const item = this.head;
    if (
      item &&
      item.id &&
      item.id.client === targetId.client &&
      item.id.clock === targetId.clock
    ) {
      return pos;
    }
    // Use forwardItem() directly to traverse ALL items including deleted ones
    while (pos.right) {
      if (
        pos.right.id &&
        pos.right.id.clock === targetId.clock &&
        pos.right.id.client === targetId.client
      ) {
        return pos;
      }
      // Use forwardItem() instead of forward() to not skip deleted items
      pos.forwardItem();
    }
    return null;
  }

  toProseMirrorDoc(schema: Schema): Node {
    const items: Item[] = [];
    let item = this.head;

    // Collect all non-deleted items from the linked list
    while (item) {
      if (!item.deleted) {
        items.push(item);
      }
      item = item.right;
    }

    // Convert items to a Slice, then extract the content as a document
    const slice = itemsToSlice(items, schema);
    return schema.nodeFromJSON({
      type: 'doc',
      content: slice.content.toJSON(),
    });
  }
}
