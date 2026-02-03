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

- `yarn test` - Run Vitest tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:ui` - Run tests with UI interface
- `yarn test:coverage` - Run tests with coverage report
- Tests are located in `yata/__tests__/` directory
- Test file should locate in `__tests__` of the same file folder of the source
  file. And file name should be the same of the source file, with `.test.ts`
  extension. e.g. `a/b.ts` test file should be `a/__tests__/b.test.ts`
- Test case should be arranged by `arrange act assert` steps. Before each step,
  a comment should mark the step name. e.g. `// Arrange`

### Linting and Type Checking

- `yarn lint` - Run TypeScript type checking on all files (including tests)
  - This runs `tsc --noEmit` which checks for type errors without emitting files
  - **IMPORTANT**: Always run this before committing to catch type errors
  - Test files are included in type checking (see `tsconfig.json`)

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

## Development Rules

### Test File Import Requirements

**CRITICAL**: All test files MUST follow these import patterns to avoid
TypeScript errors:

1. **Vitest Functions**: Always explicitly import test functions from Vitest,
   even though `globals: true` is enabled in `vite.config.ts`:

   ```typescript
   import { describe, test, expect } from 'vitest';
   ```

   **Rationale**: While Vitest globals are available at runtime, TypeScript
   requires explicit imports for type checking.

2. **Local Module Imports**: Always include `.js` extensions when importing
   local TypeScript files:

   ```typescript
   // ✅ CORRECT
   import schema from '../../example/schema.js';
   import { Document, Position } from '../document.js';
   import { TextItem, OpeningTagItem } from '../item.js';
   import { createEmptyDoc } from './helpers/test-helpers.js';

   // ❌ INCORRECT - will cause module resolution errors
   import schema from '../../example/schema';
   import { Document, Position } from '../document';
   ```

   **Rationale**: This project uses TypeScript with `NodeNext` module resolution
   (root `tsconfig.json`), which requires explicit `.js` extensions for ES
   module imports. The Vitest alias in `vite.config.ts` automatically resolves
   `.js` to `.ts` files during testing.

3. **Reference Files**: When creating new test files, use these as templates:
   - `yata/__tests__/item.test.ts` - Shows correct Vitest imports
   - `yata/__tests__/helpers/test-helpers.ts` - Shows correct `.js` extension
     usage

### Git Commit Conventions

- **Do NOT add Claude co-author line** in git commit messages. Omit the
  `Co-Authored-By: Claude ...` footer entirely.

### Pre-commit Checklist

Before committing code (especially test files), verify:

- [ ] Vitest functions (`describe`, `test`, `expect`, `beforeEach`, etc.) are
      explicitly imported
- [ ] All local imports use `.js` extensions (../../example/schema.js,
      ../document.js, etc.)
- [ ] **TypeScript compilation passes: `yarn lint`** (checks all files including
      tests)
- [ ] Tests run successfully: `yarn test`

### Remembering Rules

When the user asks Claude to "remember" a rule or convention, Claude must add it
to this CLAUDE.md file in the appropriate section. This ensures project-specific
knowledge persists across sessions.

## Context Restrictions

**IMPORTANT**: When working on the yata project, Claude must restrict all context
gathering, file reads, and edits to the `libraries/prosemirror/yata/` directory
only. Do not explore or modify files outside this folder unless explicitly
instructed by the user.

## Notation Conventions

### SetAttrItem Notation

When documenting or discussing SetAttrItem operations, use the notation
`{client:clock}.key=value` to represent a SetAttrItem concisely:

- **Format**: `{client:clock}.key=value`
- **Meaning**: A SetAttrItem that targets the item with ID `{client, clock}` and
  sets its `key` property to `value`

**Examples**:

- `{client1:5}.deleted=true` - Marks item {client1:5} as deleted
- `{client1:3}.attrs={level:2}` - Sets attrs of item {client1:3} to {level:2}
- `{client2:10}.targetId={client3:15}` - Updates targetId reference of item
  {client2:10}

**Valid Keys**:

- `deleted` - Sets the deleted flag (value: boolean)
- `attrs` - Sets node attributes (value: object, applies to OpeningTagItem and
  NodeItem)
- `targetId` - Updates paired tag reference (value: ItemID, applies to
  OpeningTagItem and ClosingTagItem)

This notation is particularly useful in:

- Test case descriptions and comments
- Documentation explaining CRDT operations
- Debug output and logging
- Commit messages describing SetAttrItem-related changes

## ProseMirror Schema

The schema extends ProseMirror's basic schema with list nodes (ordered/unordered
lists, list items). This is defined in `schema.js` and shared between both
editor instances in the demo.
