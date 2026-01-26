Document is a Yata Document, which contains items.

A typical scenario:
1. User edit a ProseMirror document, produce steps.
2. Translate ProseMirror steps into items update.
3. Broadcast items to other Document. Replace all ProseMirror nodes. Is there a better way?

An item represents:
1. An opening tag.
2. A closing tag.
3. A text.
4. A node.
5. An attribute with a value, an attribute belongs to a parent item and a key.
6. A mark, similar to an attribute, except it belongs to a text item.

# TODO
- fix test cases
- incomplete method implementations
