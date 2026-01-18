# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

This is a monorepo containing diverse programming examples and experiments
across multiple languages and technologies. The repository serves as a learning
resource and demonstration playground, covering algorithms, web APIs, libraries,
frameworks, and various programming concepts. It's structured as a collection of
independent examples, each in its own directory.

## Repository Structure

The repository is organized into top-level categories:

- **algorithms/** - Data structures and algorithm implementations (sorting,
  searching, trees, graphs, CRDT, etc.)
- **libraries/** - Integration examples for third-party libraries (ProseMirror,
  React, Y.js, Dexie, etc.)
- **web-api/** - Browser Web API demonstrations (Canvas, WebGL, WebAssembly,
  Service Workers, etc.)
- **javascript/** - JavaScript language features and patterns
- **typescript/** - TypeScript examples (generics, interfaces, types)
- **rust/** - Rust projects (shared memory, CLI tools)
- **go/** - Go examples (WebAssembly integration)
- **cascading-style-sheets/** - CSS features and techniques
- **benchmark/** - Performance comparison tests
- **network/** - Network-related examples
- **node-js/** - Node.js specific examples
- **compilers/** - Compiler and language implementation experiments
- **layout/** - Layout patterns and solutions
- **functional-programming/** - Functional programming concepts
- **machine-learning/** - ML/AI examples

Each example is typically self-contained with its own `index.html`,
`package.json`, or build configuration as needed.

## Development Commands

### Root Level

The root package.json manages global tooling and linting:

```bash
# Install dependencies
npm install

# Prepare git hooks (runs automatically after install)
npm run prepare

# Format code (handled automatically by pre-commit hook)
npx prettier --write .

# Lint JavaScript/TypeScript
npx eslint <file>

# Generate README table of contents and sitemap
npx gps toc
npx gps sitemap
```

### Testing

Tests are scattered throughout examples. Common patterns:

- **Jest-based tests**: Located in `__tests__/` directories adjacent to source
  files
- Test file naming: `<source-file>.test.js` in `__tests__/` subdirectory
  - Example: `a/b.js` → `a/__tests__/b.test.js`
- Run tests in individual example directories (e.g.,
  `libraries/prosemirror/yata/`)

### Example-Specific Commands

Many examples have their own `package.json` with scripts:

```bash
# For webpack-based examples (common in libraries/)
npm run dev      # or yarn dev - Start dev server
npm run build    # or yarn build - Production build

# For individual examples, check their package.json for available scripts
```

### Package Managers

- **Root level**: npm (specified in package.json: "packageManager":
  "npm@10.9.3")
- **Individual examples**: Check `packageManager` field in local package.json
  - Some examples use Yarn (e.g., `libraries/prosemirror/yata` uses
    yarn@1.22.22)
  - Always respect the package manager specified in each example

### Rust Projects

Located in `rust/` directory:

```bash
# Build Rust projects
cargo build

# Run Rust projects
cargo run

# Rust libraries output platform-specific files:
# - macOS: .dylib
# - Linux: .so
# - Windows: .dll
```

## Code Style and Conventions

### Formatting

Prettier is configured (`.prettierrc`) with:

- 2 spaces indentation
- Single quotes for JS/TS
- Trailing commas
- 80 character line width
- LF line endings

### Linting

ESLint configuration (`.eslintrc.cjs`):

- TypeScript ESLint plugin enabled
- Unused variables rule disabled
- Applied to JavaScript and TypeScript files

### Git Workflow

Commits follow Conventional Commits format (enforced by commitlint):

- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Format: `type(scope): description`
- Header max length: 100 characters (not enforced)

Pre-commit hooks (via Husky) automatically:

1. Generate TOC and sitemap via `gps`
2. Stage generated files
3. Run lint-staged (Prettier + ESLint)

## Architecture Patterns

### TypeScript Configuration

Root `tsconfig.json` applies to all examples:

- Allows and checks JavaScript files (`allowJs`, `checkJs`)
- Targets ESNext
- Uses NodeNext module resolution
- No emit (type checking only)

### Common Testing Patterns

Test organization follows "Arrange, Act, Assert" pattern:

```javascript
// Arrange
const input = setupTestData();

// Act
const result = functionUnderTest(input);

// Assert
expect(result).toBe(expected);
```

### Notable Implementations

**ProseMirror + YATA CRDT** (`libraries/prosemirror/yata/`):

- Custom CRDT implementation integrated with ProseMirror
- Demonstrates conflict-free collaborative editing
- Uses linked list structure with tombstone deletion
- Bidirectional conversion between ProseMirror steps and YATA items
- See `libraries/prosemirror/yata/CLAUDE.md` for detailed architecture

## Important Context

### File Organization

- Examples are independent and self-contained
- No shared dependencies between examples (each has its own node_modules if
  needed)
- HTML files are entry points for browser-based examples
- Many examples are published to GitHub Pages
  (https://vivaxy.github.io/examples/)

### Menu System

The repository uses a menu system for navigation:

- `menu.json` files define navigation structure
- HTML files use a common template
- Index pages are auto-generated for directory listings

### GitHub Pages Scripts

The repository uses `@vivaxy/github-pages-scripts` (gps) to:

- Generate README table of contents
- Create sitemap.xml for the website
- Maintain consistent structure across examples

## Working with This Repository

When adding or modifying code:

1. **Respect existing structure**: Each example is independent
2. **Follow naming conventions**: Use descriptive directory and file names
3. **Include documentation**: Add README or comments for complex examples
4. **Test appropriately**: Add tests for non-trivial logic
5. **Use correct package manager**: Check local `package.json` for
   `packageManager` field
6. **Let git hooks run**: TOC and formatting are automated
