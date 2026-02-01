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


# Not TODO

- Node attributes are currently stored as plain objects. For proper CRDT behavior with concurrent attribute edits, they should probably be CRDT items themselves.
- ProseMirror Mark Data Structure and Mark Step implementation

# TODO

- add SetAttrItem, to set deleted, node attributes, targetIds
- fix syncing issue. two docs synced state is<p>1</p><p>2</p>, delete </p><p> in doc1, sync to doc2, prosemirror will raise an error `TransformError: Inconsistent open depths`
