# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

This is an experimental implementation of the YATA (Yet Another Transformation
Approach) CRDT algorithm integrated with ProseMirror, a rich text editing
framework. The project demonstrates real-time collaborative editing by
synchronizing document state between two editor instances through a
conflict-free replicated data structure.

## Development Commands

### Build and Development

- `yarn dev` - Start development server with webpack-dev-server (auto-opens
  browser)
- `yarn build` - Create production build (outputs to bundle.js)

### Testing

- `yarn test` - Run Jest tests with experimental VM modules support
- Tests are located in `yata/__tests__/` directory
- Test file should locate in `__tests__` of the same file folder of the source
  file. And file name should be the same of the source file, with `.test.js`
  extension. e.g. `a/b.js` test file should be `a/__tests__/b.test.js`
- Test case should be arranged by `arrange act assert` steps. Before each step,
  a comment should mark the step name. e.g. `// Arrange`

Note: This project uses Yarn 1.22.22 as the package manager. Always use `yarn`
commands, not `npm`.

## Architecture

### Core Components

**YATA CRDT Implementation** (`yata/` directory):

- `Document` - The main CRDT document structure that maintains a doubly-linked
  list of items
- `Item` - Base class for document elements with conflict resolution via client
  ID and logical clock
- Item types: `OpeningTagItem`, `ClosingTagItem`, `TextItem`, `NodeItem`
- `Position` - Cursor abstraction for navigating the document's linked list
  structure

**ProseMirror Integration** (root directory):

- `index.js` - Demo application showing two synchronized editors
- `schema.js` - ProseMirror schema with basic nodes and list support
- Translates ProseMirror Steps (`ReplaceStep`, `ReplaceAroundStep`) into YATA
  item operations

### Key Design Patterns

**CRDT Conflict Resolution**:

- Each item has a unique ID composed of `{client, clock}` tuple
- Items maintain `originalLeft` and `originalRight` references for conflict-free
  insertion
- Tombstone deletion: deleted items remain in the structure with `deleted: true`
  flag
- The `greaterThan()` method determines item ordering based on client ID and
  clock values

**ProseMirror-YATA Translation**:

- ProseMirror nodes are converted to items: opening tag + content + closing tag
- Text nodes are split into individual character items (each `TextItem` holds
  one character)
- Marks (formatting) are stored as JSON on `TextItem.marks`
- Atom nodes (like images) become single `NodeItem` instances

**Document Synchronization**:

- `Document.toItems()` serializes the document into a client-keyed map of items
- `Document.applyItems()` integrates remote items using the CRDT algorithm
- Items are positioned by scanning from their original neighbors using
  `putIntoDocument()`

### Important Implementation Details

**Tag Balancing Problem**: The implementation faces a challenge when ProseMirror
removes a closing tag and the next opening tag of the same type (common in
paragraph merging). This creates unbalanced tags. The current approach uses
`replaceWithClosingTagItem()` and `replaceWithOpeningTagItem()` to maintain
references, though this is noted as a potential performance concern in comments.

**Incomplete Features** (marked with TODO/todo in code):

- `applyAddMarkStep()` and `applyRemoveMarkStep()` are not implemented
  (document.js:169-174)
- Converting YATA Document back to ProseMirror steps after `applyItems()` is
  incomplete (document.js:229)
- Attributes should potentially be items themselves rather than plain objects
  (item.js:245)

**Position Tracking**: The `Position` class maintains a `paths` stack to track
the nesting of opening tags, which is used when integrating closing tags to
properly pair them with their opening counterparts.

## Testing Strategy

Tests are organized by module:

- `document.test.js` - Tests for Document class, Position navigation, and step
  application
- `item.test.js` - Tests for item conversion between ProseMirror nodes and YATA
  items

Tests verify bidirectional conversion between ProseMirror's data structures
(Fragment, Slice) and YATA items, as well as proper integration of items into
documents.

## ProseMirror Schema

The schema extends ProseMirror's basic schema with list nodes (ordered/unordered
lists, list items). This is defined in `schema.js` and shared between both
editor instances in the demo.
