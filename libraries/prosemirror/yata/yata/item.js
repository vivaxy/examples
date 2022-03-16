/**
 * @since 2022-03-12
 * @author vivaxy
 * TODO step 2 yata change is OK, but, how to translate yata change to step?
 */
import { Fragment, Slice } from 'prosemirror-model';

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

  integrate(position) {
    this.left = position.left;
    if (this.left) {
      this.left.right = this;
    }
    this.right = position.right;
    if (this.right) {
      this.right.left = this;
    }
    if (!this.originalLeft && this.left) {
      this.originalLeft = this.left.id;
    }
    if (!this.originalRight && this.right) {
      this.originalRight = this.right.id;
    }
    this.id = {
      client: position.doc.client,
      clock: position.doc.clock,
    };
    position.doc.clock++;
    position.left = this;
  }

  delete() {
    this.deleted = true;
    if (this.left) {
      this.left.right = this.right;
    }
    if (this.right) {
      this.right.left = this.left;
    }
  }
}

export class TextItem extends Item {
  constructor(text, marks = []) {
    super();
    this.text = text;
    this.marks = marks.map((mark) => {
      return mark.toJSON();
    });
  }

  toJSON() {
    return {
      type: 'text',
      text: this.text,
      marks: this.marks,
    };
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
    this.tagName = tagName;
    this.attrs = attrs;
  }

  toJSON() {
    return {
      type: 'openingTag',
      tagName: this.tagName,
      attrs: this.attrs,
    };
  }
}

export class ClosingTagItem extends Item {
  constructor(tagName) {
    super();
    this.tagName = tagName;
    this.closedId = null;
  }

  toJSON() {
    return {
      type: 'closingTag',
      tagName: this.tagName,
    };
  }
}

export class NodeItem extends Item {
  constructor(tagName, attrs) {
    super();
    this.tagName = tagName;
    this.attrs = attrs;
  }

  toJSON() {
    return {
      type: 'node',
      tagName: this.tagName,
      attrs: this.attrs,
    };
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
  return [
    new OpeningTagItem(node.type.name, node.attrs),
    ...fragmentToItems(node.content),
    new ClosingTagItem(node.type.name, node.attrs),
  ];
}

export function itemsToFragment(items, schema) {
  let fragment = Fragment.empty;
  let openingNodes = [];

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
    } else if (item instanceof ClosingTagItem) {
      const node = openingNodes.pop();
      if (node.type.name !== item.tagName) {
        throw new Error(
          `Closing wrong tag. Expect ${item.tagName}, actual ${node.type.name}`,
        );
      }
      addToParent(node);
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

  return fragment;
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

export function itemsToSlice(items, schema) {
  const fragment = itemsToFragment(items, schema);
  return new Slice(fragment, 0, 0);
}
