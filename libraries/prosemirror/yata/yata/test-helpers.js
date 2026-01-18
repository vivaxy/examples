/**
 * Test utilities for YATA CRDT tests
 * Provides factories, helpers, and assertions to reduce test boilerplate
 */

import { Fragment, Slice } from 'prosemirror-model';
import schema from '../schema.js';
import {
  TextItem,
  OpeningTagItem,
  ClosingTagItem,
  NodeItem,
  fragmentToItems,
} from './item.js';
import { Document, Position } from './document.js';

// ============================================================================
// Document Factories
// ============================================================================

/**
 * Creates an empty YATA Document
 * @param {string} client - Optional client ID
 * @returns {Document}
 */
export function createEmptyDoc(client) {
  return new Document(client);
}

/**
 * Creates a document with plain text (no tags)
 * @param {string} text - Text content
 * @param {string} client - Optional client ID
 * @returns {Document}
 */
export function createDocWithText(text, client) {
  const doc = new Document(client);
  const items = text.split('').map((char) => new TextItem(char));
  const pos = new Position(doc);
  items.forEach((item) => item.integrate(pos));
  return doc;
}

/**
 * Creates a document with a single paragraph containing text
 * @param {string} text - Text content
 * @param {string} client - Optional client ID
 * @returns {Document}
 */
export function createDocWithParagraph(text, client) {
  const node = schema.node('paragraph', null, [schema.text(text)]);
  return Document.fromNodes(Fragment.from([node]));
}

/**
 * Creates a document with multiple paragraphs
 * @param {string[]} paragraphs - Array of paragraph text
 * @param {string} client - Optional client ID
 * @returns {Document}
 */
export function createDocWithParagraphs(paragraphs, client) {
  const nodes = paragraphs.map((text) =>
    schema.node('paragraph', null, [schema.text(text)]),
  );
  const doc = Document.fromNodes(Fragment.from(nodes));
  if (client) {
    doc.client = client;
  }
  return doc;
}

/**
 * Creates a document with a heading
 * @param {string} text - Heading text
 * @param {number} level - Heading level (1-6)
 * @param {string} client - Optional client ID
 * @returns {Document}
 */
export function createDocWithHeading(text, level = 1, client) {
  const node = schema.node('heading', { level }, [schema.text(text)]);
  const doc = Document.fromNodes(Fragment.from([node]));
  if (client) {
    doc.client = client;
  }
  return doc;
}

// ============================================================================
// Item Factories
// ============================================================================

/**
 * Creates an array of TextItems from a string
 * @param {string} text - Text to convert
 * @param {Array} marks - Optional ProseMirror marks
 * @returns {TextItem[]}
 */
export function createTextItems(text, marks = []) {
  return text.split('').map((char) => new TextItem(char, marks));
}

/**
 * Creates items for a paragraph with text
 * @param {string} text - Paragraph text
 * @param {Object} attrs - Optional paragraph attributes
 * @returns {Item[]}
 */
export function createParagraphItems(text, attrs = null) {
  const openingTag = new OpeningTagItem('paragraph', attrs);
  const textItems = createTextItems(text);
  const closingTag = new ClosingTagItem('paragraph');
  openingTag.closingTagItem = closingTag;
  closingTag.openingTagItem = openingTag;
  return [openingTag, ...textItems, closingTag];
}

/**
 * Creates items for a heading with text
 * @param {string} text - Heading text
 * @param {number} level - Heading level (1-6)
 * @returns {Item[]}
 */
export function createHeadingItems(text, level = 1) {
  const openingTag = new OpeningTagItem('heading', { level });
  const textItems = createTextItems(text);
  const closingTag = new ClosingTagItem('heading');
  openingTag.closingTagItem = closingTag;
  closingTag.openingTagItem = openingTag;
  return [openingTag, ...textItems, closingTag];
}

/**
 * Creates nested items (e.g., paragraph inside a list)
 * @param {string} outerTag - Outer tag name
 * @param {string} innerTag - Inner tag name
 * @param {string} text - Text content
 * @returns {Item[]}
 */
export function createNestedItems(outerTag, innerTag, text) {
  const outerOpening = new OpeningTagItem(outerTag, null);
  const innerOpening = new OpeningTagItem(innerTag, null);
  const textItems = createTextItems(text);
  const innerClosing = new ClosingTagItem(innerTag);
  const outerClosing = new ClosingTagItem(outerTag);

  outerOpening.closingTagItem = outerClosing;
  outerClosing.openingTagItem = outerOpening;
  innerOpening.closingTagItem = innerClosing;
  innerClosing.openingTagItem = innerOpening;

  return [outerOpening, innerOpening, ...textItems, innerClosing, outerClosing];
}

// ============================================================================
// CRDT Helpers
// ============================================================================

/**
 * Creates multiple documents for multi-client scenarios
 * @param {number} count - Number of clients
 * @param {Fragment} initialContent - Optional initial content for all docs
 * @returns {Document[]}
 */
export function createMultiClientScenario(count, initialContent = null) {
  const docs = [];
  for (let i = 0; i < count; i++) {
    const clientId = `client-${i}`;
    if (initialContent) {
      const doc = Document.fromNodes(initialContent);
      doc.client = clientId;
      docs.push(doc);
    } else {
      docs.push(new Document(clientId));
    }
  }
  return docs;
}

/**
 * Synchronizes documents by applying all items from each doc to all others
 * @param {Document[]} docs - Array of documents to synchronize
 */
export function synchronizeDocs(docs) {
  const allItems = docs.map((doc) => doc.toItems());
  docs.forEach((doc, i) => {
    allItems.forEach((items, j) => {
      if (i !== j) {
        doc.applyItems(items);
      }
    });
  });
}

/**
 * Asserts that all documents have converged to the same state
 * @param {Document[]} docs - Array of documents to check
 * @param {string} message - Optional assertion message
 */
export function assertConvergence(docs, message = 'Documents should converge') {
  if (docs.length < 2) {
    return;
  }
  const htmlStrings = docs.map((doc) => doc.toHTMLString());
  const referenceHTML = htmlStrings[0];
  htmlStrings.forEach((html, i) => {
    expect(html).toBe(referenceHTML);
  });
}

/**
 * Bidirectionally syncs two documents
 * @param {Document} doc1 - First document
 * @param {Document} doc2 - Second document
 */
export function syncBidirectional(doc1, doc2) {
  const items1 = doc1.toItems();
  const items2 = doc2.toItems();
  doc1.applyItems(items2);
  doc2.applyItems(items1);
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Asserts that a document produces the expected HTML string
 * @param {Document} doc - Document to check
 * @param {string} expectedHTML - Expected HTML output
 */
export function expectDocHTML(doc, expectedHTML) {
  expect(doc.toHTMLString()).toBe(expectedHTML);
}

/**
 * Asserts that items are in the expected order in the document
 * @param {Document} doc - Document to check
 * @param {function[]} itemTypeChecks - Array of type check functions
 */
export function expectItemsInOrder(doc, itemTypeChecks) {
  const items = doc.toArray();
  expect(items.length).toBe(itemTypeChecks.length);
  items.forEach((item, i) => {
    expect(itemTypeChecks[i](item)).toBe(true);
  });
}

/**
 * Asserts position state
 * @param {Position} pos - Position to check
 * @param {Object} expected - Expected state { pos, paths }
 */
export function expectPosition(pos, expected) {
  if (expected.pos !== undefined) {
    expect(pos.pos).toBe(expected.pos);
  }
  if (expected.paths !== undefined) {
    expect(pos.paths.length).toBe(expected.paths);
  }
  if (expected.canForward !== undefined) {
    expect(pos.canForward()).toBe(expected.canForward);
  }
}

/**
 * Asserts that an item has the expected ID
 * @param {Item} item - Item to check
 * @param {string} client - Expected client ID
 * @param {number} clock - Expected clock value
 */
export function expectItemId(item, client, clock) {
  expect(item.id.client).toBe(client);
  expect(item.id.clock).toBe(clock);
}

/**
 * Asserts that two items are properly linked
 * @param {Item} left - Left item
 * @param {Item} right - Right item
 */
export function expectItemsLinked(left, right) {
  expect(left.right).toBe(right);
  expect(right.left).toBe(left);
}

/**
 * Asserts document size (number of non-deleted items)
 * @param {Document} doc - Document to check
 * @param {number} expectedSize - Expected size
 */
export function expectDocSize(doc, expectedSize) {
  const items = doc.toArray().filter((item) => !item.deleted);
  expect(items.length).toBe(expectedSize);
}

// ============================================================================
// Debug Utilities
// ============================================================================

/**
 * Logs the current document state for debugging
 * @param {Document} doc - Document to log
 * @param {string} label - Optional label
 */
export function logDocState(doc, label = 'Document State') {
  console.log(`\n=== ${label} ===`);
  console.log('Client:', doc.client);
  console.log('Clock:', doc.clock);
  console.log('HTML:', doc.toHTMLString());
  console.log('Items:', doc.toArray().length);
}

/**
 * Visualizes the item chain for debugging
 * @param {Document} doc - Document to visualize
 * @returns {string} Visual representation
 */
export function visualizeItemChain(doc) {
  const items = doc.toArray();
  return items
    .map((item) => {
      let type = 'Item';
      let content = '';
      if (item instanceof TextItem) {
        type = 'Text';
        content = item.text;
      } else if (item instanceof OpeningTagItem) {
        type = 'Open';
        content = item.tagName;
      } else if (item instanceof ClosingTagItem) {
        type = 'Close';
        content = item.tagName;
      } else if (item instanceof NodeItem) {
        type = 'Node';
        content = item.tagName;
      }
      const deleted = item.deleted ? '[DEL]' : '';
      return `${type}(${content})${deleted}`;
    })
    .join(' -> ');
}

/**
 * Gets item type as string for debugging
 * @param {Item} item - Item to identify
 * @returns {string}
 */
export function getItemTypeName(item) {
  if (item instanceof TextItem) return 'TextItem';
  if (item instanceof OpeningTagItem) return 'OpeningTagItem';
  if (item instanceof ClosingTagItem) return 'ClosingTagItem';
  if (item instanceof NodeItem) return 'NodeItem';
  return 'Item';
}

// ============================================================================
// Type Checkers (for use with expectItemsInOrder)
// ============================================================================

export const isTextItem = (item) => item instanceof TextItem;
export const isOpeningTagItem = (item) => item instanceof OpeningTagItem;
export const isClosingTagItem = (item) => item instanceof ClosingTagItem;
export const isNodeItem = (item) => item instanceof NodeItem;
export const isDeleted = (item) => item.deleted;
export const isNotDeleted = (item) => !item.deleted;

/**
 * Creates a checker for a text item with specific text
 * @param {string} text - Expected text
 * @returns {function}
 */
export function isTextItemWith(text) {
  return (item) => item instanceof TextItem && item.text === text;
}

/**
 * Creates a checker for an opening tag with specific name
 * @param {string} tagName - Expected tag name
 * @returns {function}
 */
export function isOpeningTag(tagName) {
  return (item) => item instanceof OpeningTagItem && item.tagName === tagName;
}

/**
 * Creates a checker for a closing tag with specific name
 * @param {string} tagName - Expected tag name
 * @returns {function}
 */
export function isClosingTag(tagName) {
  return (item) => item instanceof ClosingTagItem && item.tagName === tagName;
}
