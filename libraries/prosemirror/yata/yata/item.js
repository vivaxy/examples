/**
 * @since 2022-03-12
 * @author vivaxy
 */
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
  constructor(text, marks) {
    super();
    this.text = text;
    this.marks = marks;
  }
}

/**
 * ProseMirror may update single tag (e.g. remove closing tag and next same opening tag).
 * This will cause the tags are not balanced, which breaks the document.
 * How to fix this?
 *  - Option 1: Replace the unchanged tag with a new tag. This may bring performance issue.
 */
export class TagItem extends Item {
  constructor(tagName, attrs) {
    super();
    this.tagName = tagName;
    this.closedId = null;
    this.attrs = attrs;
  }
}

export class NodeItem extends Item {
  constructor(attrs) {
    super();
    this.attrs = attrs;
  }
}
