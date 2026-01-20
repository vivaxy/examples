/**
 * Test utilities for YATA CRDT tests
 * Provides factories, helpers, and assertions to reduce test boilerplate
 */

import { Fragment, Slice } from 'prosemirror-model';
import type { Mark } from 'prosemirror-model';
import schema from '../../../schema.js';
import {
  TextItem,
  OpeningTagItem,
  ClosingTagItem,
  NodeItem,
  fragmentToItems,
  Item,
} from '../../item.js';
import { Document, Position } from '../../document.js';
import type { NodeAttributes, ItemID } from '../../types.js';

// ============================================================================
// Document Factories
// ============================================================================

/**
 * Creates an empty YATA Document
 */
export function createEmptyDoc(client?: string): Document {
  return new Document(client);
}

/**
 * Creates a document with plain text (no tags)
 */
export function createDocWithText(text: string, client?: string): Document {
  const doc = new Document(client);
  const items = text.split('').map((char) => new TextItem(char));
  const pos = new Position(doc);
  items.forEach((item) => item.integrate(pos));
  return doc;
}

/**
 * Creates a document with a single paragraph containing text
 */
export function createDocWithParagraph(
  text: string,
  client?: string,
): Document {
  const node = schema.node('paragraph', null, [schema.text(text)]);
  return Document.fromNodes(Fragment.from([node]));
}

/**
 * Creates a document with multiple paragraphs
 */
export function createDocWithParagraphs(
  paragraphs: string[],
  client?: string,
): Document {
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
 */
export function createDocWithHeading(
  text: string,
  level: number = 1,
  client?: string,
): Document {
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
 */
export function createTextItems(text: string, marks: Mark[] = []): TextItem[] {
  return text.split('').map((char) => new TextItem(char, marks));
}

/**
 * Creates items for a paragraph with text
 */
export function createParagraphItems(
  text: string,
  attrs: NodeAttributes = null,
): Item[] {
  const openingTag = new OpeningTagItem('paragraph', attrs);
  const textItems = createTextItems(text);
  const closingTag = new ClosingTagItem('paragraph');
  openingTag.closingTagItem = closingTag;
  closingTag.openingTagItem = openingTag;
  return [openingTag, ...textItems, closingTag];
}

/**
 * Creates items for a heading with text
 */
export function createHeadingItems(text: string, level: number = 1): Item[] {
  const openingTag = new OpeningTagItem('heading', { level });
  const textItems = createTextItems(text);
  const closingTag = new ClosingTagItem('heading');
  openingTag.closingTagItem = closingTag;
  closingTag.openingTagItem = openingTag;
  return [openingTag, ...textItems, closingTag];
}

/**
 * Creates nested items (e.g., paragraph inside a list)
 */
export function createNestedItems(
  outerTag: string,
  innerTag: string,
  text: string,
): Item[] {
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
 */
export function createMultiClientScenario(
  count: number,
  initialContent: Fragment | null = null,
): Document[] {
  const docs: Document[] = [];
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
 */
export function synchronizeDocs(docs: Document[]): void {
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
 */
export function assertConvergence(
  docs: Document[],
  message: string = 'Documents should converge',
): void {
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
 */
export function syncBidirectional(doc1: Document, doc2: Document): void {
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
 */
export function expectDocHTML(doc: Document, expectedHTML: string): void {
  expect(doc.toHTMLString()).toBe(expectedHTML);
}

/**
 * Asserts that items are in the expected order in the document
 */
export function expectItemsInOrder(
  doc: Document,
  itemTypeChecks: Array<(item: Item) => boolean>,
): void {
  const items = doc.toArray();
  expect(items.length).toBe(itemTypeChecks.length);
  items.forEach((item, i) => {
    expect(itemTypeChecks[i](item)).toBe(true);
  });
}

/**
 * Asserts position state
 */
export function expectPosition(
  pos: Position,
  expected: { pos?: number; paths?: number; canForward?: boolean },
): void {
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
 */
export function expectItemId(item: Item, client: string, clock: number): void {
  expect(item.id!.client).toBe(client);
  expect(item.id!.clock).toBe(clock);
}

/**
 * Asserts that two items are properly linked
 */
export function expectItemsLinked(left: Item, right: Item): void {
  expect(left.right).toBe(right);
  expect(right.left).toBe(left);
}

/**
 * Asserts document size (number of non-deleted items)
 */
export function expectDocSize(doc: Document, expectedSize: number): void {
  const items = doc.toArray().filter((item) => !item.deleted);
  expect(items.length).toBe(expectedSize);
}

/**
 * Type assertion that an item has an ID
 * Useful for TypeScript narrowing in tests
 */
export function assertHasId(item: Item): asserts item is Item & { id: ItemID } {
  if (!item.id) {
    throw new Error('Test assertion failed: Item should have ID');
  }
}

// ============================================================================
// Debug Utilities
// ============================================================================

/**
 * Logs the current document state for debugging
 */
export function logDocState(
  doc: Document,
  label: string = 'Document State',
): void {
  console.log(`\n=== ${label} ===`);
  console.log('Client:', doc.client);
  console.log('Clock:', doc.clock);
  console.log('HTML:', doc.toHTMLString());
  console.log('Items:', doc.toArray().length);
}

/**
 * Visualizes the item chain for debugging
 */
export function visualizeItemChain(doc: Document): string {
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
 */
export function getItemTypeName(item: Item): string {
  if (item instanceof TextItem) return 'TextItem';
  if (item instanceof OpeningTagItem) return 'OpeningTagItem';
  if (item instanceof ClosingTagItem) return 'ClosingTagItem';
  if (item instanceof NodeItem) return 'NodeItem';
  return 'Item';
}

// ============================================================================
// Type Checkers (for use with expectItemsInOrder)
// ============================================================================

export const isTextItem = (item: Item): boolean => item instanceof TextItem;
export const isOpeningTagItem = (item: Item): boolean =>
  item instanceof OpeningTagItem;
export const isClosingTagItem = (item: Item): boolean =>
  item instanceof ClosingTagItem;
export const isNodeItem = (item: Item): boolean => item instanceof NodeItem;
export const isDeleted = (item: Item): boolean => item.deleted;
export const isNotDeleted = (item: Item): boolean => !item.deleted;

/**
 * Creates a checker for a text item with specific text
 */
export function isTextItemWith(text: string): (item: Item) => boolean {
  return (item: Item) => item instanceof TextItem && item.text === text;
}

/**
 * Creates a checker for an opening tag with specific name
 */
export function isOpeningTag(tagName: string): (item: Item) => boolean {
  return (item: Item) =>
    item instanceof OpeningTagItem && item.tagName === tagName;
}

/**
 * Creates a checker for a closing tag with specific name
 */
export function isClosingTag(tagName: string): (item: Item) => boolean {
  return (item: Item) =>
    item instanceof ClosingTagItem && item.tagName === tagName;
}
