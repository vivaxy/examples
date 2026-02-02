import type { Fragment, Schema, Node } from 'prosemirror-model';
import { Slice } from 'prosemirror-model';
import type {
  Step,
  AddMarkStep,
  RemoveMarkStep,
  ReplaceAroundStep,
} from 'prosemirror-transform';
import { ReplaceStep } from 'prosemirror-transform';
import {
  ClosingTagItem,
  OpeningTagItem,
  SetAttrItem,
  sliceToItems,
  fragmentToItems,
  itemsToSlice,
  Item,
  TextItem,
  NodeItem,
} from './item.js';
import type { ItemID, ClientMap, ItemChange } from './types.js';

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
        // Only pop from paths if we have a matching opening tag
        // This can happen when findItemById() traverses the document starting
        // from the beginning with an empty paths array
        if (this.paths.length > 0) {
          console.assert(
            this.left.tagName === this.paths[this.paths.length - 1].tagName,
          );
          this.paths.pop();
        }
      }
    }
  }

  forwardToDeletionEnd(): void {
    while (
      this.right &&
      (this.right.deleted || this.right instanceof SetAttrItem)
    ) {
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

      // Create a SetAttrItem with setDeleted: true pointing to this item
      if (item.id) {
        const setAttrItem = new SetAttrItem(item.id, { setDeleted: true });
        setAttrItem.integrate($pos);
      }

      // Mark the target as deleted immediately (local operation)
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
      if (item instanceof ClosingTagItem && item.targetId) {
        // Find the opening tag by ID
        const openingPos = this.findItemById(item.targetId);
        if (
          openingPos &&
          openingPos.right &&
          !items.includes(openingPos.right) &&
          !openingPos.right.deleted
        ) {
          // this is a closing item, and its corresponding opening item is not newly integrated and not deleted
          (openingPos.right as OpeningTagItem).replaceWithClosingTagItem(
            this,
            item,
          );
        }
      }
      if (item instanceof OpeningTagItem && item.targetId) {
        // Find the closing tag by ID
        const closingPos = this.findItemById(item.targetId);
        if (
          closingPos &&
          closingPos.right &&
          !items.includes(closingPos.right) &&
          !closingPos.right.deleted
        ) {
          // this is an opening item, and its corresponding closing item is not newly integrated and not deleted
          (closingPos.right as ClosingTagItem).replaceWithOpeningTagItem(
            this,
            item,
          );
        }
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

  /**
   * Converts the document to a string representation.
   * Includes the document's client ID, clock value, and a visualization of all items
   * with their individual client:clock IDs.
   *
   * @returns String representation of the document
   * @example
   * const doc = createDocWithParagraph('hi');
   * console.log(doc.toString());
   * // Output:
   * // Document(client: abc123, clock: 4)
   * // Open(paragraph){abc123:0} -> Text(h){abc123:1} -> Text(i){abc123:2} -> Close(paragraph){abc123:3}
   */
  toString(): string {
    const itemsStr = this.toArray()
      .map((item) => {
        let repr = '';
        if (item instanceof TextItem) {
          repr = `Text(${item.text})`;
        } else if (item instanceof OpeningTagItem) {
          repr = `Open(${item.tagName})`;
        } else if (item instanceof ClosingTagItem) {
          repr = `Close(${item.tagName})`;
        } else if (item instanceof NodeItem) {
          repr = `Node(${item.tagName})`;
        } else if (item instanceof SetAttrItem) {
          repr = `SetAttr(${item.target.client}:${item.target.clock})`;
        } else {
          repr = 'Item';
        }

        // Add client:clock ID
        const idStr = item.id
          ? `{${item.id.client}:${item.id.clock}}`
          : '{no-id}';
        repr += idStr;

        return item.deleted ? `${repr}[DEL]` : repr;
      })
      .join(' -> ');

    return `Document(client: ${this.client}, clock: ${this.clock})\n${itemsStr}`;
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

  applyItems(clientMap: ClientMap, schema: Schema): ReplaceStep[] {
    const changes: ItemChange[] = [];

    // First pass: integrate all items into the document and collect changes
    Object.keys(clientMap).forEach((client) => {
      const items = clientMap[client];
      items.forEach((itemJSON) => {
        const item = Item.fromJSON(itemJSON);
        const change = item.putIntoDocument(this);
        if (change) {
          changes.push(change);
        }
      });
    });

    // Convert changes to ProseMirror steps
    return this.changesToSteps(changes, schema);
  }

  private changesToSteps(changes: ItemChange[], schema: Schema): ReplaceStep[] {
    if (changes.length === 0) {
      return [];
    }

    // Sort changes by pmPosition (ascending)
    const sortedChanges = [...changes].sort(
      (a, b) => a.pmPosition - b.pmPosition,
    );

    // Group adjacent changes of the same type
    interface ChangeGroup {
      type: 'insert' | 'delete';
      items: Item[];
      startPos: number;
    }

    const groups: ChangeGroup[] = [];
    let currentGroup: ChangeGroup | null = null;

    for (const change of sortedChanges) {
      if (
        !currentGroup ||
        currentGroup.type !== change.type ||
        currentGroup.startPos + currentGroup.items.length !== change.pmPosition
      ) {
        // Start a new group
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          type: change.type,
          items: [change.item],
          startPos: change.pmPosition,
        };
      } else {
        // Extend current group
        currentGroup.items.push(change.item);
      }
    }
    if (currentGroup) {
      groups.push(currentGroup);
    }

    // Convert groups to ReplaceStep objects
    // Process in reverse order (highest position first) to avoid position shifts
    const steps: ReplaceStep[] = [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const group = groups[i];
      if (group.type === 'insert') {
        // Insert: from=to=startPos, slice contains new items
        const slice = itemsToSlice(group.items, schema);
        steps.push(new ReplaceStep(group.startPos, group.startPos, slice));
      } else {
        // Delete: from=startPos, to=startPos+count, slice is empty
        const count = group.items.length;
        steps.push(
          new ReplaceStep(group.startPos, group.startPos + count, Slice.empty),
        );
      }
    }

    // Reverse to get correct application order (low to high positions)
    return steps.reverse();
  }

  findItemById(id: ItemID | null): Position | null {
    if (!id) {
      return null;
    }
    const targetId = id;

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

  findSetAttrItemsByTarget(target: ItemID): SetAttrItem[] {
    const results: SetAttrItem[] = [];
    let item = this.head;
    while (item) {
      if (
        item instanceof SetAttrItem &&
        item.target.client === target.client &&
        item.target.clock === target.clock
      ) {
        results.push(item);
      }
      item = item.right;
    }
    return results;
  }

  toProseMirrorDoc(schema: Schema): Node {
    const items: Item[] = [];
    let item = this.head;

    // Collect all non-deleted items from the linked list, excluding SetAttrItems
    while (item) {
      if (!item.deleted && !(item instanceof SetAttrItem)) {
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
