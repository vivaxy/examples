/**
 * @since 2022-03-12
 * @author vivaxy
 */
import { Fragment, Slice } from 'prosemirror-model';

function attrsToQueryString(attrs) {
  if (!attrs) {
    return '';
  }
  let attrString = '';
  Object.keys(attrs).forEach(function (key) {
    attrString += ` ${key}="${attrs[key]}"`;
  });
  return attrString;
}

export class ID {
  constructor(client, clock) {
    this.client = client;
    this.clock = clock;
  }
}

export class Item {
  constructor() {
    this.id = null;
    this.left = null;
    this.right = null;
    this.originalLeft = null;
    this.originalRight = null;
    this.deleted = false;
  }

  static itemMap = {};

  insertIntoPosition(pos) {
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

  integrateInner(doc, originalLeft, originalRight) {
    if (originalLeft) {
      if (!this.originalLeft) {
        this.originalLeft = originalLeft;
      }
      if (!originalLeft.originalRight) {
        originalLeft.originalRight = this;
      }
    }
    if (originalRight) {
      if (!this.originalRight) {
        this.originalRight = originalRight;
      }
      if (!originalRight.originalLeft) {
        originalRight.originalLeft = this;
      }
    }

    this.id = {
      client: doc.client,
      clock: doc.clock,
    };
    doc.clock++;
  }

  integrate(position) {
    this.integrateInner(position.doc, position.left, position.right);
    this.insertIntoPosition(position);
  }

  putIntoDocument(doc) {
    const foundPos = doc.findItemById(this.id);
    if (foundPos) {
      // already put into document
      return;
    }

    if (doc.head === null && !this.originalLeft && this.originalRight) {
      doc.head = this;
      return doc.resolvePosition();
    }

    const originalLeftPos = doc.findItemById(this.originalLeft);
    const originalRightPos = doc.findItemById(this.originalRight);

    if (!originalLeftPos && !originalRightPos) {
      throw new Error('Left and Right not found');
    }
    if (originalLeftPos) {
      // findItemById returns position where pos.right === found item
      // We need position after the item, so advance once
      originalLeftPos.forward();

      // Scan right to find the correct position
      // Skip items that have the same originalLeft and should come before us
      while (originalLeftPos.right) {
        const nextItem = originalLeftPos.right;

        // Check if nextItem has the same originalLeft as us
        const nextHasSameOriginalLeft =
          nextItem.originalLeft &&
          ((nextItem.originalLeft.id &&
            nextItem.originalLeft.id.client === this.originalLeft.client &&
            nextItem.originalLeft.id.clock === this.originalLeft.clock) ||
            (nextItem.originalLeft.client === this.originalLeft.client &&
              nextItem.originalLeft.clock === this.originalLeft.clock));

        // Only skip if it has same originalLeft AND should come before us
        if (nextHasSameOriginalLeft && !nextItem.greaterThan(this)) {
          originalLeftPos.forward();
        } else {
          break;
        }
      }
      this.insertIntoPosition(originalLeftPos);
      return originalLeftPos;
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
      return originalRightPos;
    }
  }

  delete() {
    if (this.deleted) {
      return;
    }
    this.deleted = true;
  }

  toJSON() {
    const { originalLeft, originalRight } = this;
    const json = {
      id: {
        client: this.id.client,
        clock: this.id.clock,
      },
    };
    if (originalLeft) {
      json.originalLeft = {
        client: originalLeft.id.client,
        clock: originalLeft.id.clock,
      };
    }
    if (originalRight) {
      json.originalRight = {
        client: originalRight.id.client,
        clock: originalRight.id.clock,
      };
    }
    return json;
  }

  static setId(item, json) {
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
    return item;
  }

  static fromJSON(json) {
    return this.itemMap[json.type].fromJSON(json);
  }

  greaterThan(item) {
    if (this.id.client < item.id.client) {
      return false;
    }
    if (this.id.client > item.id.client) {
      return true;
    }
    return this.id.clock > item.id.clock;
  }
}

export class MapItem {
  constructor() {
    this.id = null;
    this.parent = null;
    this.key = null;
    this.value = null;
    this.deleted = false;
  }

  integrate(key, value, parent, doc) {
    this.parent = parent;
    this.id = {
      client: doc.client,
      clock: doc.clock,
    };
    doc.clock++;
  }

  delete() {
    if (this.deleted) {
      return;
    }
    this.deleted = true;
  }
}

export class TextItem extends Item {
  constructor(text, marks = []) {
    super();
    Item.itemMap['text'] = TextItem;
    this.text = text;
    this.marks = marks.map((mark) => {
      return mark.toJSON();
    });
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      type: 'text',
      text: this.text,
      marks: this.marks,
    };
  }

  static fromJSON(json) {
    const textItem = new TextItem(json.text, json.marks);
    return Item.setId(textItem, json);
  }

  toHTMLString() {
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
  constructor(tagName, attrs) {
    super();
    Item.itemMap['openingTag'] = OpeningTagItem;
    this.tagName = tagName;
    // todo attrs should be items too
    this.attrs = attrs;
    this.closingTagItem = null;
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      type: 'openingTag',
      tagName: this.tagName,
      attrs: this.attrs,
      closingTagItem: this.closingTagItem.id,
    };
  }

  static fromJSON(json) {
    const openingTagItem = new OpeningTagItem(json.tagName, json.attrs);
    openingTagItem.closingTagItem = json.closingTagItem;
    return Item.setId(openingTagItem, json);
  }

  integrate(position) {
    super.integrate(position);
    position.paths.push(this);
  }

  replaceWithClosingTagItem(doc, closingTagItem) {
    this.delete();
    const newOpeningTagItem = new OpeningTagItem(this.tagName, this.attrs);
    newOpeningTagItem.integrateInner(doc, this.left, this.right);
    this.closingTagItem = closingTagItem;
  }

  toHTMLString() {
    if (this.deleted) {
      return '';
    }
    return `<${this.tagName}${attrsToQueryString(this.attrs)}>`;
  }
}

export class ClosingTagItem extends Item {
  constructor(tagName) {
    super();
    Item.itemMap['closingTag'] = ClosingTagItem;
    this.tagName = tagName;
    this.openingTagItem = null;
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      type: 'closingTag',
      tagName: this.tagName,
      openingTagItem: this.openingTagItem?.id,
    };
  }

  static fromJSON(json) {
    const closingTagItem = new ClosingTagItem(json.tagName);
    closingTagItem.openingTagItem = json.openingTagItem;
    return Item.setId(closingTagItem, json);
  }

  integrate(position) {
    super.integrate(position);
    console.assert(position.paths.length > 0);
    const openingTagTag = position.paths.pop();
    openingTagTag.closingTagItem = this;
  }

  replaceWithOpeningTagItem(doc, openingTagItem) {
    this.delete();
    const newClosingTagItem = new ClosingTagItem(this.tagName, this.attrs);
    newClosingTagItem.integrateInner(doc, this.left, this.right);
    this.openingTagItem = openingTagItem;
  }

  toHTMLString() {
    if (this.deleted) {
      return '';
    }
    return `</${this.tagName}>`;
  }
}

export class NodeItem extends Item {
  constructor(tagName, attrs) {
    super();
    Item.itemMap['node'] = NodeItem;
    this.tagName = tagName;
    this.attrs = attrs;
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      type: 'node',
      tagName: this.tagName,
      attrs: this.attrs,
    };
  }

  static fromJSON(json) {
    const nodeItem = new NodeItem(json.tagName, json.attrs);
    return Item.setId(nodeItem, json);
  }

  toHTMLString() {
    if (this.deleted) {
      return '';
    }
    return `<${this.tagName}${attrsToQueryString(this.attrs)} />`;
  }
}

export function nodeToItems(node) {
  if (node.isText) {
    return node.text.split('').map((text) => {
      return new TextItem(text, node.marks);
    });
  }
  if (node.isAtom) {
    return [new NodeItem(node.type.name, node.attrs)];
  }
  const openingTagItem = new OpeningTagItem(node.type.name, node.attrs);
  const closingTagItem = new ClosingTagItem(node.type.name, node.attrs);
  openingTagItem.closingTagItem = closingTagItem;
  closingTagItem.openingTagItem = openingTagItem;
  return [openingTagItem, ...fragmentToItems(node.content), closingTagItem];
}

export function itemsToSlice(items, schema) {
  let fragment = Fragment.empty;
  let openingNodes = [];
  let closingNode = null;
  let openStart = 0;
  let currentDepth = 0;

  function addToParent(node) {
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
      openingNodes.push(schema.node(item.tagName, item.attrs));
      if (closingNode) {
        addToParent(closingNode);
      }
      currentDepth++;
    } else if (item instanceof ClosingTagItem) {
      const node = openingNodes.pop();
      if (!node) {
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
        if (node.type.name !== item.tagName) {
          throw new Error(
            `Closing wrong tag. Expect ${item.tagName}, actual ${node.type.name}`,
          );
        }
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

  if (openingNodes) {
    fragment = fragment.append(Fragment.from(openingNodes));
  }

  return new Slice(fragment, openStart, currentDepth);
}

export function fragmentToItems(fragment) {
  const items = [];
  fragment.forEach((node) => {
    items.push(...nodeToItems(node));
  });
  return items;
}

export function sliceToItems(slice) {
  const items = fragmentToItems(slice.content);
  return items.slice(slice.openStart, items.length - slice.openEnd);
}
