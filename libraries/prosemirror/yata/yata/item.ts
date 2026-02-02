import { Fragment, Slice } from 'prosemirror-model';
import type { Node, Mark, Schema } from 'prosemirror-model';
import type {
  ItemID,
  AnyItemJSON,
  TextItemJSON,
  OpeningTagItemJSON,
  ClosingTagItemJSON,
  NodeItemJSON,
  SetAttrItemJSON,
  SetAttrKey,
  SetAttrValue,
  ItemMap,
  NodeAttributes,
  MarkJSON,
  ItemChange,
} from './types.js';
import type { Position, Document } from './document.js';

function attrsToQueryString(attrs: NodeAttributes): string {
  if (!attrs) {
    return '';
  }
  let attrString = '';
  Object.keys(attrs).forEach(function (key) {
    attrString += ` ${key}="${attrs[key]}"`;
  });
  return attrString;
}

function getItemId(item: Item, context: string = 'operation'): ItemID {
  if (!item.id) {
    throw new Error(
      `Item must be integrated before ${context}. Item has no ID assigned.`,
    );
  }
  return item.id;
}

function itemIdsEqual(id1: ItemID | null, id2: ItemID | null): boolean {
  if (!id1 || !id2) return false;
  return id1.client === id2.client && id1.clock === id2.clock;
}

export class ID {
  client: string;
  clock: number;

  constructor(client: string, clock: number) {
    this.client = client;
    this.clock = clock;
  }
}

export class Item {
  id: ItemID | null;
  left: Item | null;
  right: Item | null;
  originalLeft: ItemID | null;
  originalRight: ItemID | null;
  deleted: boolean;

  constructor() {
    this.id = null;
    this.left = null;
    this.right = null;
    this.originalLeft = null;
    this.originalRight = null;
    this.deleted = false;
  }

  static itemMap: Partial<ItemMap> = {};

  insertIntoPosition(pos: Position): void {
    this.left = pos.left;
    this.right = pos.right;
    if (pos.left === null && pos.right === null) {
      // empty doc
      pos.doc.head = this;
    } else if (pos.left === null && pos.right !== null) {
      // inserting at the head of non-empty doc
      pos.doc.head = this;
    }
    pos.left = this;
    if (this.left) {
      this.left.right = this;
    }
    if (this.right) {
      this.right.left = this;
    }
  }

  integrateInner(
    doc: Document,
    originalLeft: Item | null,
    originalRight: Item | null,
  ): void {
    if (originalLeft) {
      if (!this.originalLeft) {
        this.originalLeft = originalLeft.id;
      }
      if (!originalLeft.originalRight) {
        originalLeft.originalRight = this.id || {
          client: doc.client,
          clock: doc.clock,
        };
      }
    }
    if (originalRight) {
      if (!this.originalRight) {
        this.originalRight = originalRight.id;
      }
      if (!originalRight.originalLeft) {
        originalRight.originalLeft = this.id || {
          client: doc.client,
          clock: doc.clock,
        };
      }
    }

    this.id = {
      client: doc.client,
      clock: doc.clock,
    };
    doc.clock++;
  }

  integrate(position: Position): void {
    this.integrateInner(position.doc, position.left, position.right);
    this.insertIntoPosition(position);
  }

  isIntegrated(doc?: Document): boolean {
    // An item is integrated if it's part of a linked list structure
    // Check if item has neighbors first (most common case)
    const hasNeighbors = this.left !== null || this.right !== null;
    if (hasNeighbors) return true;

    // Edge case: item is the sole item in the document (is doc.head)
    // Note: An item can have an id but not be integrated yet (e.g., deserialized from JSON)
    return doc !== undefined && doc.head === this;
  }

  putIntoDocument(doc: Document): ItemChange | undefined {
    const foundPos = doc.findItemById(this.id);
    if (foundPos) {
      // Item already exists in document - update deleted status if incoming item is deleted
      // Deletions are permanent (tombstones), so once deleted, always deleted
      if (this.deleted && foundPos.right && !foundPos.right.deleted) {
        foundPos.right.deleted = true;
        // Return delete change - foundPos.pos is the ProseMirror position
        return {
          type: 'delete',
          item: foundPos.right,
          pmPosition: foundPos.pos,
        };
      }
      return;
    }

    // Handle empty document cases
    if (doc.head === null) {
      if (!this.originalLeft && !this.originalRight) {
        // First item ever - neither left nor right references
        doc.head = this;
        const pos = doc.resolvePosition();
        if (this.deleted) {
          return { type: 'delete', item: this, pmPosition: pos.pos };
        }
        return { type: 'insert', item: this, pmPosition: pos.pos };
      }
      if (!this.originalLeft && this.originalRight) {
        // Has right reference but no left
        doc.head = this;
        const pos = doc.resolvePosition();
        if (this.deleted) {
          return { type: 'delete', item: this, pmPosition: pos.pos };
        }
        return { type: 'insert', item: this, pmPosition: pos.pos };
      }
    }

    const originalLeftPos = doc.findItemById(this.originalLeft);
    const originalRightPos = doc.findItemById(this.originalRight);

    if (!originalLeftPos && !originalRightPos) {
      // Neither reference found - this can happen when integrating concurrent
      // inserts that both started from empty documents
      // Place at the beginning and use CRDT ordering
      const pos = doc.resolvePosition(0);

      // Scan forward to find correct position based on item ordering
      // Skip items that should come before us (lessThan)
      while (pos.canForward()) {
        const nextItem = pos.right;

        if (nextItem && nextItem.lessThan(this)) {
          pos.forward();
        } else {
          break;
        }
      }

      this.insertIntoPosition(pos);
      if (this.left === null) {
        doc.head = this;
      }
      if (this.deleted) {
        return { type: 'delete', item: this, pmPosition: pos.pos };
      }
      return { type: 'insert', item: this, pmPosition: pos.pos };
    }
    if (originalLeftPos) {
      // findItemById returns position where pos.right === found item
      // We need position after the item, so advance once
      // Use forwardItem() instead of forward() because forward() skips deleted items
      // and we want to scan from right after originalLeft, even if it's deleted
      originalLeftPos.forwardItem();

      // Scan right to find the correct position
      // Skip items that should come before us according to YATA algorithm:
      // 1. Items with same originalLeft that are lessThan us
      // 2. Items whose originalRight equals our originalLeft that are lessThan us
      // But stop if we reach our originalRight (don't go past it)
      while (originalLeftPos.right) {
        const nextItem = originalLeftPos.right;

        // Check if nextItem has the same originalLeft as us
        const nextHasSameOriginalLeft = itemIdsEqual(
          nextItem.originalLeft,
          this.originalLeft,
        );

        // Check if nextItem's originalRight equals our originalLeft
        const nextOriginalRightEqualsOurOriginalLeft = itemIdsEqual(
          nextItem.originalRight,
          this.originalLeft,
        );

        // Determine if YATA rules say to skip this item:
        // - It has same originalLeft AND should come before us, OR
        // - Its originalRight equals our originalLeft AND should come before us
        const shouldSkipByYATA =
          (nextHasSameOriginalLeft && nextItem.lessThan(this)) ||
          (nextOriginalRightEqualsOurOriginalLeft && nextItem.lessThan(this));

        if (shouldSkipByYATA) {
          // Check BEFORE advancing - originalRight is a hard boundary we must not cross
          // This ensures items inserted between originalLeft and originalRight stay there
          if (itemIdsEqual(nextItem.id, this.originalRight)) {
            break;
          }
          // Use forwardItem() instead of forward() to avoid skipping deleted items
          // We want to check every item in the linked list, including deleted ones
          originalLeftPos.forwardItem();
        } else {
          // YATA rules don't match - stop here
          break;
        }
      }
      this.insertIntoPosition(originalLeftPos);
      if (this.deleted) {
        return { type: 'delete', item: this, pmPosition: originalLeftPos.pos };
      }
      return { type: 'insert', item: this, pmPosition: originalLeftPos.pos };
    }

    // Only originalRight is found - insert before originalRight
    if (originalRightPos) {
      // originalRightPos is where pos.right === originalRight item
      // Insert at this position (before originalRight)
      this.insertIntoPosition(originalRightPos);

      // Update doc.head if we inserted at the beginning
      if (this.left === null) {
        doc.head = this;
      }
      if (this.deleted) {
        return { type: 'delete', item: this, pmPosition: originalRightPos.pos };
      }
      return { type: 'insert', item: this, pmPosition: originalRightPos.pos };
    }
  }

  delete(): void {
    if (this.deleted) {
      return;
    }
    this.deleted = true;
  }

  toJSON(): AnyItemJSON {
    const json: Partial<AnyItemJSON> = {
      id: getItemId(this, 'serialization'),
      type: 'text', // Will be overridden by subclasses
    };
    if (this.originalLeft) {
      json.originalLeft = this.originalLeft;
    }
    if (this.originalRight) {
      json.originalRight = this.originalRight;
    }
    if (this.deleted) {
      json.deleted = true;
    }
    return json as AnyItemJSON;
  }

  static setId(item: Item, json: AnyItemJSON): Item {
    item.id = {
      client: json.id.client,
      clock: json.id.clock,
    };
    if (json.originalLeft) {
      item.originalLeft = {
        client: json.originalLeft.client,
        clock: json.originalLeft.clock,
      };
    }
    if (json.originalRight) {
      item.originalRight = {
        client: json.originalRight.client,
        clock: json.originalRight.clock,
      };
    }
    if (json.deleted) {
      item.deleted = true;
    }
    return item;
  }

  static fromJSON(json: AnyItemJSON): Item {
    const ItemClass = this.itemMap[json.type];
    if (!ItemClass) {
      throw new Error(`Unknown item type: ${json.type}`);
    }
    // Type assertion needed because each fromJSON expects its specific JSON type
    return ItemClass.fromJSON(json as any);
  }

  greaterThan(item: Item): boolean {
    if (!this.id || !item.id) {
      return false;
    }
    if (this.id.client < item.id.client) {
      return false;
    }
    if (this.id.client > item.id.client) {
      return true;
    }
    return this.id.clock > item.id.clock;
  }

  lessThan(item: Item): boolean {
    if (!this.id || !item.id) {
      return false;
    }
    if (this.id.client < item.id.client) {
      return true;
    }
    if (this.id.client > item.id.client) {
      return false;
    }
    return this.id.clock < item.id.clock;
  }

  toHTMLString(): string {
    return '';
  }
}

/**
 * MapItem - Generic item for potential future use with map-like CRDTs
 *
 * Currently not used in the main YATA implementation. This class is exported
 * but has no active usage in the codebase. It's kept for potential future
 * extensions to support map-like collaborative data structures.
 *
 * Note: Uses generic `any` types as this is speculative code for future use.
 */
export class MapItem<TParent = unknown, TValue = unknown> {
  id: ItemID | null;
  parent: TParent | null;
  key: string | null;
  value: TValue | null;
  deleted: boolean;

  constructor() {
    this.id = null;
    this.parent = null;
    this.key = null;
    this.value = null;
    this.deleted = false;
  }

  integrate(key: string, value: TValue, parent: TParent, doc: Document): void {
    this.parent = parent;
    this.id = {
      client: doc.client,
      clock: doc.clock,
    };
    doc.clock++;
  }

  delete(): void {
    if (this.deleted) {
      return;
    }
    this.deleted = true;
  }
}

export class TextItem extends Item {
  text: string;
  marks: MarkJSON[];

  constructor(text: string, marks: Mark[] = []) {
    super();
    Item.itemMap['text'] = TextItem;
    this.text = text;
    this.marks = marks.map((mark) => {
      return mark.toJSON();
    });
  }

  toJSON(): TextItemJSON {
    const base = super.toJSON();
    return {
      ...base,
      type: 'text' as const,
      text: this.text,
      marks: this.marks,
    };
  }

  static fromJSON(json: TextItemJSON): TextItem {
    const textItem = new TextItem(json.text, []);
    textItem.marks = json.marks;
    return Item.setId(textItem, json) as TextItem;
  }

  toHTMLString(): string {
    if (this.deleted) {
      return '';
    }
    return this.text;
  }
}

/**
 * ProseMirror may update single tag (e.g. remove closing tag and next same opening tag).
 * This will cause the tags are not balanced, which breaks the document.
 * How to fix this?
 *  - Option 1: Replace the unchanged tag with a new tag. This may bring performance issue.
 */
export class OpeningTagItem extends Item {
  tagName: string;
  attrs: NodeAttributes;
  targetId: ItemID | null;

  constructor(tagName: string, attrs: NodeAttributes) {
    super();
    Item.itemMap['openingTag'] = OpeningTagItem;
    this.tagName = tagName;
    // todo attrs should be items too
    this.attrs = attrs;
    this.targetId = null;
  }

  toJSON(): OpeningTagItemJSON {
    const base = super.toJSON();
    if (!this.targetId) {
      throw new Error('OpeningTagItem must have a targetId to serialize');
    }
    return {
      ...base,
      type: 'openingTag' as const,
      tagName: this.tagName,
      attrs: this.attrs,
      closingTagItem: this.targetId,
    };
  }

  static fromJSON(json: OpeningTagItemJSON): OpeningTagItem {
    const openingTagItem = new OpeningTagItem(json.tagName, json.attrs);
    openingTagItem.targetId = json.closingTagItem;
    return Item.setId(openingTagItem, json) as OpeningTagItem;
  }

  integrate(position: Position): void {
    super.integrate(position);
    position.paths.push(this);
  }

  replaceWithClosingTagItem(
    doc: Document,
    closingTagItem: ClosingTagItem,
  ): void {
    // Store neighbors before deletion
    const left = this.left;
    const right = this.right;

    this.delete();
    const newOpeningTagItem = new OpeningTagItem(this.tagName, this.attrs);
    newOpeningTagItem.integrateInner(doc, left, right);

    // Insert the new tag into the linked list at the same position
    newOpeningTagItem.left = left;
    newOpeningTagItem.right = right;
    if (left) {
      left.right = newOpeningTagItem;
    } else if (doc.head === this) {
      doc.head = newOpeningTagItem;
    }
    if (right) {
      right.left = newOpeningTagItem;
    }

    if (!closingTagItem.id) {
      throw new Error('ClosingTagItem must be integrated before pairing');
    }
    // Set bidirectional references
    newOpeningTagItem.targetId = closingTagItem.id;
    closingTagItem.targetId = newOpeningTagItem.id;
  }

  getClosingTagItem(doc: Document): ClosingTagItem | null {
    if (!this.targetId) return null;
    const pos = doc.findItemById(this.targetId);
    return pos?.right as ClosingTagItem | null;
  }

  toHTMLString(): string {
    if (this.deleted) {
      return '';
    }
    return `<${this.tagName}${attrsToQueryString(this.attrs)}>`;
  }
}

export class ClosingTagItem extends Item {
  tagName: string;
  targetId: ItemID | null;

  constructor(tagName: string) {
    super();
    Item.itemMap['closingTag'] = ClosingTagItem;
    this.tagName = tagName;
    this.targetId = null;
  }

  toJSON(): ClosingTagItemJSON {
    const base = super.toJSON();
    const result: ClosingTagItemJSON = {
      ...base,
      type: 'closingTag' as const,
      tagName: this.tagName,
    };
    if (this.targetId) {
      result.openingTagItem = this.targetId;
    }
    return result;
  }

  static fromJSON(json: ClosingTagItemJSON): ClosingTagItem {
    const closingTagItem = new ClosingTagItem(json.tagName);
    closingTagItem.targetId = json.openingTagItem || null;
    return Item.setId(closingTagItem, json) as ClosingTagItem;
  }

  integrate(position: Position): void {
    super.integrate(position);
    console.assert(position.paths.length > 0);
    const openingTagItem = position.paths.pop()!;
    if (!this.id || !openingTagItem.id) {
      throw new Error('Both tags must be integrated before pairing');
    }
    // Only pair with non-deleted opening tags
    // Deleted tags will be handled by updatePairedTagsAfterReplace
    if (!openingTagItem.deleted) {
      this.targetId = openingTagItem.id;
      openingTagItem.targetId = this.id;
    }
  }

  replaceWithOpeningTagItem(
    doc: Document,
    openingTagItem: OpeningTagItem,
  ): void {
    // Store neighbors before deletion
    const left = this.left;
    const right = this.right;

    this.delete();
    const newClosingTagItem = new ClosingTagItem(this.tagName);
    newClosingTagItem.integrateInner(doc, left, right);

    // Insert the new tag into the linked list at the same position
    newClosingTagItem.left = left;
    newClosingTagItem.right = right;
    if (left) {
      left.right = newClosingTagItem;
    } else if (doc.head === this) {
      doc.head = newClosingTagItem;
    }
    if (right) {
      right.left = newClosingTagItem;
    }

    if (!openingTagItem.id) {
      throw new Error('OpeningTagItem must be integrated before pairing');
    }
    // Set bidirectional references
    newClosingTagItem.targetId = openingTagItem.id;
    openingTagItem.targetId = newClosingTagItem.id;
  }

  getOpeningTagItem(doc: Document): OpeningTagItem | null {
    if (!this.targetId) return null;
    const pos = doc.findItemById(this.targetId);
    return pos?.right as OpeningTagItem | null;
  }

  toHTMLString(): string {
    if (this.deleted) {
      return '';
    }
    return `</${this.tagName}>`;
  }
}

export class NodeItem extends Item {
  tagName: string;
  attrs: NodeAttributes;

  constructor(tagName: string, attrs: NodeAttributes) {
    super();
    Item.itemMap['node'] = NodeItem;
    this.tagName = tagName;
    this.attrs = attrs;
  }

  toJSON(): NodeItemJSON {
    const base = super.toJSON();
    return {
      ...base,
      type: 'node' as const,
      tagName: this.tagName,
      attrs: this.attrs,
    };
  }

  static fromJSON(json: NodeItemJSON): NodeItem {
    const nodeItem = new NodeItem(json.tagName, json.attrs);
    return Item.setId(nodeItem, json) as NodeItem;
  }

  toHTMLString(): string {
    if (this.deleted) {
      return '';
    }
    return `<${this.tagName}${attrsToQueryString(this.attrs)} />`;
  }
}

export class SetAttrItem extends Item {
  target: ItemID;
  key: SetAttrKey;
  value: SetAttrValue;

  constructor(target: ItemID, key: SetAttrKey, value: SetAttrValue) {
    super();
    Item.itemMap['setAttr'] = SetAttrItem;
    this.target = target;
    this.key = key;
    this.value = value;
  }

  private applyToTarget(targetItem: Item): void {
    switch (this.key) {
      case 'deleted':
        targetItem.deleted = this.value as boolean;
        break;
      case 'attrs':
        if (targetItem instanceof OpeningTagItem || targetItem instanceof NodeItem) {
          targetItem.attrs = this.value as NodeAttributes;
        }
        break;
      case 'targetId':
        if (targetItem instanceof OpeningTagItem || targetItem instanceof ClosingTagItem) {
          targetItem.targetId = this.value as ItemID;
        }
        break;
    }
  }

  integrate(position: Position): void {
    super.integrate(position);

    // After integrating this SetAttrItem, apply changes to the target
    const targetPos = position.doc.findItemById(this.target);
    if (targetPos && targetPos.right) {
      this.applyToTarget(targetPos.right);
    }
  }

  putIntoDocument(doc: Document): ItemChange | undefined {
    // Check if this SetAttrItem already exists
    const foundPos = doc.findItemById(this.id);
    if (foundPos) {
      return; // Already integrated
    }

    // Insert the SetAttrItem itself into the structure using base class logic
    const insertResult = super.putIntoDocument(doc);

    // Find the target item and determine if applying changes generates a visible change
    const targetPos = doc.findItemById(this.target);
    if (targetPos && targetPos.right) {
      const targetItem = targetPos.right;

      // Check if this SetAttrItem will cause a visible change
      if (this.key === 'deleted' && this.value === true) {
        // Setting deleted=true generates a delete change only if target wasn't already deleted
        if (!targetItem.deleted) {
          this.applyToTarget(targetItem);
          return { type: 'delete', item: targetItem, pmPosition: targetPos.pos };
        }
      } else {
        // For other attribute changes (attrs, targetId), apply them but don't generate steps
        // These changes don't directly affect ProseMirror document structure
        this.applyToTarget(targetItem);
      }

      // Target exists but change doesn't produce a visible effect
      return undefined;
    }

    // Target doesn't exist yet - return insert change for the SetAttrItem itself
    // so it's tracked in the document and will apply when target arrives
    return insertResult;
  }

  toJSON(): SetAttrItemJSON {
    const base = super.toJSON();
    return {
      ...base,
      type: 'setAttr' as const,
      target: this.target,
      key: this.key,
      value: this.value,
    };
  }

  static fromJSON(json: SetAttrItemJSON): SetAttrItem {
    const setAttrItem = new SetAttrItem(json.target, json.key, json.value);
    return Item.setId(setAttrItem, json) as SetAttrItem;
  }

  toHTMLString(): string {
    // SetAttrItems don't render
    return '';
  }
}

export function nodeToItems(node: Node): Item[] {
  if (node.isText) {
    return node.text!.split('').map((text) => {
      return new TextItem(text, [...node.marks]);
    });
  }
  if (node.isAtom) {
    return [new NodeItem(node.type.name, node.attrs)];
  }
  const openingTagItem = new OpeningTagItem(node.type.name, node.attrs);
  const closingTagItem = new ClosingTagItem(node.type.name);
  // Tag pairing will happen during integration via ClosingTagItem.integrate()
  return [openingTagItem, ...fragmentToItems(node.content), closingTagItem];
}

export function itemsToSlice(items: Item[], schema: Schema): Slice {
  let fragment = Fragment.empty;
  const openingNodes: Array<{
    tagName: string;
    attrs: NodeAttributes;
    content: Fragment;
  }> = [];
  let closingNode: Node | null = null;
  let openStart = 0;
  let currentDepth = 0;

  function addToParent(node: Node): void {
    if (openingNodes.length) {
      openingNodes[openingNodes.length - 1].content = openingNodes[
        openingNodes.length - 1
      ].content.append(Fragment.from([node]));
    } else {
      fragment = fragment.append(Fragment.from(node));
    }
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item instanceof OpeningTagItem) {
      // Store tag metadata instead of creating the node immediately
      // Some nodes (like bullet_list) cannot be created empty
      openingNodes.push({
        tagName: item.tagName,
        attrs: item.attrs,
        content: Fragment.empty,
      });
      if (closingNode) {
        // Don't nest closingNode inside the new opening tag
        // Instead, add it directly to fragment as a sibling
        fragment = fragment.append(Fragment.from([closingNode]));
        closingNode = null;
      }
      currentDepth++;
    } else if (item instanceof ClosingTagItem) {
      const nodeData = openingNodes.pop();
      if (!nodeData) {
        // handle start with closing node
        if (closingNode) {
          closingNode = schema.node(item.tagName, null, [closingNode]);
          openStart++;
        } else {
          closingNode = schema.node(item.tagName, null, fragment);
          fragment = Fragment.empty;
          console.assert(openStart === 0);
          openStart++;
        }
      } else {
        if (nodeData.tagName !== item.tagName) {
          throw new Error(
            `Closing wrong tag. Expect ${item.tagName}, actual ${nodeData.tagName}`,
          );
        }
        // Create the actual node now that we have its content
        const node = schema.node(
          nodeData.tagName,
          nodeData.attrs,
          nodeData.content,
        );
        addToParent(node);
        currentDepth--;
      }
    } else if (item instanceof NodeItem) {
      addToParent(schema.node(item.tagName, item.attrs));
    } else if (item instanceof TextItem) {
      addToParent(
        schema.text(
          item.text,
          item.marks.map((mark) => {
            return schema.mark(mark.type, mark.attrs);
          }),
        ),
      );
    }
  }

  if (closingNode) {
    fragment = fragment.append(Fragment.from([closingNode]));
  }

  if (openingNodes.length) {
    // Create any remaining unclosed nodes with their partial content
    const remainingNodes = openingNodes.map((nodeData) => {
      return schema.node(nodeData.tagName, nodeData.attrs, nodeData.content);
    });
    fragment = fragment.append(Fragment.from(remainingNodes));
  }

  return new Slice(fragment, openStart, currentDepth);
}

export function fragmentToItems(fragment: Fragment): Item[] {
  const items: Item[] = [];
  fragment.forEach((node) => {
    items.push(...nodeToItems(node));
  });
  return items;
}

export function sliceToItems(slice: Slice): Item[] {
  const items = fragmentToItems(slice.content);
  return items.slice(slice.openStart, items.length - slice.openEnd);
}
