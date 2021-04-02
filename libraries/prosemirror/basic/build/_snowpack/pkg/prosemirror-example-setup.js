import {
  P as Plugin,
  a as PluginKey,
  S as Selection,
  A as AllSelection,
  N as NodeSelection,
  T as TextSelection,
} from './common/index.es-42a53777.js';
import {
  M as Mapping,
  l as liftTarget,
  c as canSplit,
  R as ReplaceAroundStep,
  a as canJoin,
  f as findWrapping,
  j as joinPoint,
  d as dropPoint,
} from './common/index.es-1069d43c.js';
import { F as Fragment, S as Slice } from './common/index.es-585f8d64.js';
import {
  D as DecorationSet,
  a as Decoration,
} from './common/index.es-d66e9223.js';
import {
  w as wrapInList,
  s as splitListItem,
  l as liftListItem,
  a as sinkListItem,
} from './common/index.es-5271c736.js';

var base = {
  8: 'Backspace',
  9: 'Tab',
  10: 'Enter',
  12: 'NumLock',
  13: 'Enter',
  16: 'Shift',
  17: 'Control',
  18: 'Alt',
  20: 'CapsLock',
  27: 'Escape',
  32: ' ',
  33: 'PageUp',
  34: 'PageDown',
  35: 'End',
  36: 'Home',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  44: 'PrintScreen',
  45: 'Insert',
  46: 'Delete',
  59: ';',
  61: '=',
  91: 'Meta',
  92: 'Meta',
  106: '*',
  107: '+',
  108: ',',
  109: '-',
  110: '.',
  111: '/',
  144: 'NumLock',
  145: 'ScrollLock',
  160: 'Shift',
  161: 'Shift',
  162: 'Control',
  163: 'Control',
  164: 'Alt',
  165: 'Alt',
  173: '-',
  186: ';',
  187: '=',
  188: ',',
  189: '-',
  190: '.',
  191: '/',
  192: '`',
  219: '[',
  220: '\\',
  221: ']',
  222: "'",
  229: 'q',
};

var shift = {
  48: ')',
  49: '!',
  50: '@',
  51: '#',
  52: '$',
  53: '%',
  54: '^',
  55: '&',
  56: '*',
  57: '(',
  59: ':',
  61: '+',
  173: '_',
  186: ':',
  187: '+',
  188: '<',
  189: '_',
  190: '>',
  191: '?',
  192: '~',
  219: '{',
  220: '|',
  221: '}',
  222: '"',
  229: 'Q',
};

var chrome =
  typeof navigator != 'undefined' && /Chrome\/(\d+)/.exec(navigator.userAgent);
var safari =
  typeof navigator != 'undefined' && /Apple Computer/.test(navigator.vendor);
var gecko =
  typeof navigator != 'undefined' && /Gecko\/\d+/.test(navigator.userAgent);
var mac$3 = typeof navigator != 'undefined' && /Mac/.test(navigator.platform);
var ie =
  typeof navigator != 'undefined' &&
  /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
var brokenModifierNames =
  (chrome && (mac$3 || +chrome[1] < 57)) || (gecko && mac$3);

// Fill in the digit keys
for (var i = 0; i < 10; i++) base[48 + i] = base[96 + i] = String(i);

// The function keys
for (var i = 1; i <= 24; i++) base[i + 111] = 'F' + i;

// And the alphabetic keys
for (var i = 65; i <= 90; i++) {
  base[i] = String.fromCharCode(i + 32);
  shift[i] = String.fromCharCode(i);
}

// For each code that doesn't have a shift-equivalent, copy the base name
for (var code in base)
  if (!shift.hasOwnProperty(code)) shift[code] = base[code];

function keyName(event) {
  // Don't trust event.key in Chrome when there are modifiers until
  // they fix https://bugs.chromium.org/p/chromium/issues/detail?id=633838
  var ignoreKey =
    (brokenModifierNames && (event.ctrlKey || event.altKey || event.metaKey)) ||
    ((safari || ie) && event.shiftKey && event.key && event.key.length == 1);
  var name =
    (!ignoreKey && event.key) ||
    (event.shiftKey ? shift : base)[event.keyCode] ||
    event.key ||
    'Unidentified';
  // Edge sometimes produces wrong names (Issue #3)
  if (name == 'Esc') name = 'Escape';
  if (name == 'Del') name = 'Delete';
  // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8860571/
  if (name == 'Left') name = 'ArrowLeft';
  if (name == 'Up') name = 'ArrowUp';
  if (name == 'Right') name = 'ArrowRight';
  if (name == 'Down') name = 'ArrowDown';
  return name;
}

// declare global: navigator

var mac$2 =
  typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false;

function normalizeKeyName(name) {
  var parts = name.split(/-(?!$)/),
    result = parts[parts.length - 1];
  if (result == 'Space') {
    result = ' ';
  }
  var alt, ctrl, shift, meta;
  for (var i = 0; i < parts.length - 1; i++) {
    var mod = parts[i];
    if (/^(cmd|meta|m)$/i.test(mod)) {
      meta = true;
    } else if (/^a(lt)?$/i.test(mod)) {
      alt = true;
    } else if (/^(c|ctrl|control)$/i.test(mod)) {
      ctrl = true;
    } else if (/^s(hift)?$/i.test(mod)) {
      shift = true;
    } else if (/^mod$/i.test(mod)) {
      if (mac$2) {
        meta = true;
      } else {
        ctrl = true;
      }
    } else {
      throw new Error('Unrecognized modifier name: ' + mod);
    }
  }
  if (alt) {
    result = 'Alt-' + result;
  }
  if (ctrl) {
    result = 'Ctrl-' + result;
  }
  if (meta) {
    result = 'Meta-' + result;
  }
  if (shift) {
    result = 'Shift-' + result;
  }
  return result;
}

function normalize(map) {
  var copy = Object.create(null);
  for (var prop in map) {
    copy[normalizeKeyName(prop)] = map[prop];
  }
  return copy;
}

function modifiers(name, event, shift) {
  if (event.altKey) {
    name = 'Alt-' + name;
  }
  if (event.ctrlKey) {
    name = 'Ctrl-' + name;
  }
  if (event.metaKey) {
    name = 'Meta-' + name;
  }
  if (shift !== false && event.shiftKey) {
    name = 'Shift-' + name;
  }
  return name;
}

// :: (Object) → Plugin
// Create a keymap plugin for the given set of bindings.
//
// Bindings should map key names to [command](#commands)-style
// functions, which will be called with `(EditorState, dispatch,
// EditorView)` arguments, and should return true when they've handled
// the key. Note that the view argument isn't part of the command
// protocol, but can be used as an escape hatch if a binding needs to
// directly interact with the UI.
//
// Key names may be strings like `"Shift-Ctrl-Enter"`—a key
// identifier prefixed with zero or more modifiers. Key identifiers
// are based on the strings that can appear in
// [`KeyEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
// Use lowercase letters to refer to letter keys (or uppercase letters
// if you want shift to be held). You may use `"Space"` as an alias
// for the `" "` name.
//
// Modifiers can be given in any order. `Shift-` (or `s-`), `Alt-` (or
// `a-`), `Ctrl-` (or `c-` or `Control-`) and `Cmd-` (or `m-` or
// `Meta-`) are recognized. For characters that are created by holding
// shift, the `Shift-` prefix is implied, and should not be added
// explicitly.
//
// You can use `Mod-` as a shorthand for `Cmd-` on Mac and `Ctrl-` on
// other platforms.
//
// You can add multiple keymap plugins to an editor. The order in
// which they appear determines their precedence (the ones early in
// the array get to dispatch first).
function keymap(bindings) {
  return new Plugin({ props: { handleKeyDown: keydownHandler(bindings) } });
}

// :: (Object) → (view: EditorView, event: dom.Event) → bool
// Given a set of bindings (using the same format as
// [`keymap`](#keymap.keymap), return a [keydown
// handler](#view.EditorProps.handleKeyDown) that handles them.
function keydownHandler(bindings) {
  var map = normalize(bindings);
  return function (view, event) {
    var name = keyName(event),
      isChar = name.length == 1 && name != ' ',
      baseName;
    var direct = map[modifiers(name, event, !isChar)];
    if (direct && direct(view.state, view.dispatch, view)) {
      return true;
    }
    if (
      isChar &&
      (event.shiftKey ||
        event.altKey ||
        event.metaKey ||
        name.charCodeAt(0) > 127) &&
      (baseName = base[event.keyCode]) &&
      baseName != name
    ) {
      // Try falling back to the keyCode when there's a modifier
      // active or the character produced isn't ASCII, and our table
      // produces a different name from the the keyCode. See #668,
      // #1060
      var fromCode = map[modifiers(baseName, event, true)];
      if (fromCode && fromCode(view.state, view.dispatch, view)) {
        return true;
      }
    } else if (isChar && event.shiftKey) {
      // Otherwise, if shift is active, also try the binding with the
      // Shift- prefix enabled. See #997
      var withShift = map[modifiers(name, event, true)];
      if (withShift && withShift(view.state, view.dispatch, view)) {
        return true;
      }
    }
    return false;
  };
}

var GOOD_LEAF_SIZE = 200;

// :: class<T> A rope sequence is a persistent sequence data structure
// that supports appending, prepending, and slicing without doing a
// full copy. It is represented as a mostly-balanced tree.
var RopeSequence = function RopeSequence() {};

RopeSequence.prototype.append = function append(other) {
  if (!other.length) {
    return this;
  }
  other = RopeSequence.from(other);

  return (
    (!this.length && other) ||
    (other.length < GOOD_LEAF_SIZE && this.leafAppend(other)) ||
    (this.length < GOOD_LEAF_SIZE && other.leafPrepend(this)) ||
    this.appendInner(other)
  );
};

// :: (union<[T], RopeSequence<T>>) → RopeSequence<T>
// Prepend an array or other rope to this one, returning a new rope.
RopeSequence.prototype.prepend = function prepend(other) {
  if (!other.length) {
    return this;
  }
  return RopeSequence.from(other).append(this);
};

RopeSequence.prototype.appendInner = function appendInner(other) {
  return new Append(this, other);
};

// :: (?number, ?number) → RopeSequence<T>
// Create a rope repesenting a sub-sequence of this rope.
RopeSequence.prototype.slice = function slice(from, to) {
  if (from === void 0) from = 0;
  if (to === void 0) to = this.length;

  if (from >= to) {
    return RopeSequence.empty;
  }
  return this.sliceInner(Math.max(0, from), Math.min(this.length, to));
};

// :: (number) → T
// Retrieve the element at the given position from this rope.
RopeSequence.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) {
    return undefined;
  }
  return this.getInner(i);
};

// :: ((element: T, index: number) → ?bool, ?number, ?number)
// Call the given function for each element between the given
// indices. This tends to be more efficient than looping over the
// indices and calling `get`, because it doesn't have to descend the
// tree for every element.
RopeSequence.prototype.forEach = function forEach(f, from, to) {
  if (from === void 0) from = 0;
  if (to === void 0) to = this.length;

  if (from <= to) {
    this.forEachInner(f, from, to, 0);
  } else {
    this.forEachInvertedInner(f, from, to, 0);
  }
};

// :: ((element: T, index: number) → U, ?number, ?number) → [U]
// Map the given functions over the elements of the rope, producing
// a flat array.
RopeSequence.prototype.map = function map(f, from, to) {
  if (from === void 0) from = 0;
  if (to === void 0) to = this.length;

  var result = [];
  this.forEach(
    function (elt, i) {
      return result.push(f(elt, i));
    },
    from,
    to,
  );
  return result;
};

// :: (?union<[T], RopeSequence<T>>) → RopeSequence<T>
// Create a rope representing the given array, or return the rope
// itself if a rope was given.
RopeSequence.from = function from(values) {
  if (values instanceof RopeSequence) {
    return values;
  }
  return values && values.length ? new Leaf(values) : RopeSequence.empty;
};

var Leaf = /*@__PURE__*/ (function (RopeSequence) {
  function Leaf(values) {
    RopeSequence.call(this);
    this.values = values;
  }

  if (RopeSequence) Leaf.__proto__ = RopeSequence;
  Leaf.prototype = Object.create(RopeSequence && RopeSequence.prototype);
  Leaf.prototype.constructor = Leaf;

  var prototypeAccessors = {
    length: { configurable: true },
    depth: { configurable: true },
  };

  Leaf.prototype.flatten = function flatten() {
    return this.values;
  };

  Leaf.prototype.sliceInner = function sliceInner(from, to) {
    if (from == 0 && to == this.length) {
      return this;
    }
    return new Leaf(this.values.slice(from, to));
  };

  Leaf.prototype.getInner = function getInner(i) {
    return this.values[i];
  };

  Leaf.prototype.forEachInner = function forEachInner(f, from, to, start) {
    for (var i = from; i < to; i++) {
      if (f(this.values[i], start + i) === false) {
        return false;
      }
    }
  };

  Leaf.prototype.forEachInvertedInner = function forEachInvertedInner(
    f,
    from,
    to,
    start,
  ) {
    for (var i = from - 1; i >= to; i--) {
      if (f(this.values[i], start + i) === false) {
        return false;
      }
    }
  };

  Leaf.prototype.leafAppend = function leafAppend(other) {
    if (this.length + other.length <= GOOD_LEAF_SIZE) {
      return new Leaf(this.values.concat(other.flatten()));
    }
  };

  Leaf.prototype.leafPrepend = function leafPrepend(other) {
    if (this.length + other.length <= GOOD_LEAF_SIZE) {
      return new Leaf(other.flatten().concat(this.values));
    }
  };

  prototypeAccessors.length.get = function () {
    return this.values.length;
  };

  prototypeAccessors.depth.get = function () {
    return 0;
  };

  Object.defineProperties(Leaf.prototype, prototypeAccessors);

  return Leaf;
})(RopeSequence);

// :: RopeSequence
// The empty rope sequence.
RopeSequence.empty = new Leaf([]);

var Append = /*@__PURE__*/ (function (RopeSequence) {
  function Append(left, right) {
    RopeSequence.call(this);
    this.left = left;
    this.right = right;
    this.length = left.length + right.length;
    this.depth = Math.max(left.depth, right.depth) + 1;
  }

  if (RopeSequence) Append.__proto__ = RopeSequence;
  Append.prototype = Object.create(RopeSequence && RopeSequence.prototype);
  Append.prototype.constructor = Append;

  Append.prototype.flatten = function flatten() {
    return this.left.flatten().concat(this.right.flatten());
  };

  Append.prototype.getInner = function getInner(i) {
    return i < this.left.length
      ? this.left.get(i)
      : this.right.get(i - this.left.length);
  };

  Append.prototype.forEachInner = function forEachInner(f, from, to, start) {
    var leftLen = this.left.length;
    if (
      from < leftLen &&
      this.left.forEachInner(f, from, Math.min(to, leftLen), start) === false
    ) {
      return false;
    }
    if (
      to > leftLen &&
      this.right.forEachInner(
        f,
        Math.max(from - leftLen, 0),
        Math.min(this.length, to) - leftLen,
        start + leftLen,
      ) === false
    ) {
      return false;
    }
  };

  Append.prototype.forEachInvertedInner = function forEachInvertedInner(
    f,
    from,
    to,
    start,
  ) {
    var leftLen = this.left.length;
    if (
      from > leftLen &&
      this.right.forEachInvertedInner(
        f,
        from - leftLen,
        Math.max(to, leftLen) - leftLen,
        start + leftLen,
      ) === false
    ) {
      return false;
    }
    if (
      to < leftLen &&
      this.left.forEachInvertedInner(f, Math.min(from, leftLen), to, start) ===
        false
    ) {
      return false;
    }
  };

  Append.prototype.sliceInner = function sliceInner(from, to) {
    if (from == 0 && to == this.length) {
      return this;
    }
    var leftLen = this.left.length;
    if (to <= leftLen) {
      return this.left.slice(from, to);
    }
    if (from >= leftLen) {
      return this.right.slice(from - leftLen, to - leftLen);
    }
    return this.left
      .slice(from, leftLen)
      .append(this.right.slice(0, to - leftLen));
  };

  Append.prototype.leafAppend = function leafAppend(other) {
    var inner = this.right.leafAppend(other);
    if (inner) {
      return new Append(this.left, inner);
    }
  };

  Append.prototype.leafPrepend = function leafPrepend(other) {
    var inner = this.left.leafPrepend(other);
    if (inner) {
      return new Append(inner, this.right);
    }
  };

  Append.prototype.appendInner = function appendInner(other) {
    if (this.left.depth >= Math.max(this.right.depth, other.depth) + 1) {
      return new Append(this.left, new Append(this.right, other));
    }
    return new Append(this, other);
  };

  return Append;
})(RopeSequence);

var ropeSequence = RopeSequence;

// ProseMirror's history isn't simply a way to roll back to a previous
// state, because ProseMirror supports applying changes without adding
// them to the history (for example during collaboration).
//
// To this end, each 'Branch' (one for the undo history and one for
// the redo history) keeps an array of 'Items', which can optionally
// hold a step (an actual undoable change), and always hold a position
// map (which is needed to move changes below them to apply to the
// current document).
//
// An item that has both a step and a selection bookmark is the start
// of an 'event' — a group of changes that will be undone or redone at
// once. (It stores only the bookmark, since that way we don't have to
// provide a document until the selection is actually applied, which
// is useful when compressing.)

// Used to schedule history compression
var max_empty_items = 500;

var Branch = function Branch(items, eventCount) {
  this.items = items;
  this.eventCount = eventCount;
};

// : (EditorState, bool) → ?{transform: Transform, selection: ?SelectionBookmark, remaining: Branch}
// Pop the latest event off the branch's history and apply it
// to a document transform.
Branch.prototype.popEvent = function popEvent(state, preserveItems) {
  var this$1 = this;

  if (this.eventCount == 0) {
    return null;
  }

  var end = this.items.length;
  for (; ; end--) {
    var next = this.items.get(end - 1);
    if (next.selection) {
      --end;
      break;
    }
  }

  var remap, mapFrom;
  if (preserveItems) {
    remap = this.remapping(end, this.items.length);
    mapFrom = remap.maps.length;
  }
  var transform = state.tr;
  var selection, remaining;
  var addAfter = [],
    addBefore = [];

  this.items.forEach(
    function (item, i) {
      if (!item.step) {
        if (!remap) {
          remap = this$1.remapping(end, i + 1);
          mapFrom = remap.maps.length;
        }
        mapFrom--;
        addBefore.push(item);
        return;
      }

      if (remap) {
        addBefore.push(new Item(item.map));
        var step = item.step.map(remap.slice(mapFrom)),
          map;

        if (step && transform.maybeStep(step).doc) {
          map = transform.mapping.maps[transform.mapping.maps.length - 1];
          addAfter.push(
            new Item(map, null, null, addAfter.length + addBefore.length),
          );
        }
        mapFrom--;
        if (map) {
          remap.appendMap(map, mapFrom);
        }
      } else {
        transform.maybeStep(item.step);
      }

      if (item.selection) {
        selection = remap
          ? item.selection.map(remap.slice(mapFrom))
          : item.selection;
        remaining = new Branch(
          this$1.items
            .slice(0, end)
            .append(addBefore.reverse().concat(addAfter)),
          this$1.eventCount - 1,
        );
        return false;
      }
    },
    this.items.length,
    0,
  );

  return { remaining: remaining, transform: transform, selection: selection };
};

// : (Transform, ?SelectionBookmark, Object) → Branch
// Create a new branch with the given transform added.
Branch.prototype.addTransform = function addTransform(
  transform,
  selection,
  histOptions,
  preserveItems,
) {
  var newItems = [],
    eventCount = this.eventCount;
  var oldItems = this.items,
    lastItem =
      !preserveItems && oldItems.length
        ? oldItems.get(oldItems.length - 1)
        : null;

  for (var i = 0; i < transform.steps.length; i++) {
    var step = transform.steps[i].invert(transform.docs[i]);
    var item = new Item(transform.mapping.maps[i], step, selection),
      merged = void 0;
    if ((merged = lastItem && lastItem.merge(item))) {
      item = merged;
      if (i) {
        newItems.pop();
      } else {
        oldItems = oldItems.slice(0, oldItems.length - 1);
      }
    }
    newItems.push(item);
    if (selection) {
      eventCount++;
      selection = null;
    }
    if (!preserveItems) {
      lastItem = item;
    }
  }
  var overflow = eventCount - histOptions.depth;
  if (overflow > DEPTH_OVERFLOW) {
    oldItems = cutOffEvents(oldItems, overflow);
    eventCount -= overflow;
  }
  return new Branch(oldItems.append(newItems), eventCount);
};

Branch.prototype.remapping = function remapping(from, to) {
  var maps = new Mapping();
  this.items.forEach(
    function (item, i) {
      var mirrorPos =
        item.mirrorOffset != null && i - item.mirrorOffset >= from
          ? maps.maps.length - item.mirrorOffset
          : null;
      maps.appendMap(item.map, mirrorPos);
    },
    from,
    to,
  );
  return maps;
};

Branch.prototype.addMaps = function addMaps(array) {
  if (this.eventCount == 0) {
    return this;
  }
  return new Branch(
    this.items.append(
      array.map(function (map) {
        return new Item(map);
      }),
    ),
    this.eventCount,
  );
};

// : (Transform, number)
// When the collab module receives remote changes, the history has
// to know about those, so that it can adjust the steps that were
// rebased on top of the remote changes, and include the position
// maps for the remote changes in its array of items.
Branch.prototype.rebased = function rebased(rebasedTransform, rebasedCount) {
  if (!this.eventCount) {
    return this;
  }

  var rebasedItems = [],
    start = Math.max(0, this.items.length - rebasedCount);

  var mapping = rebasedTransform.mapping;
  var newUntil = rebasedTransform.steps.length;
  var eventCount = this.eventCount;
  this.items.forEach(function (item) {
    if (item.selection) {
      eventCount--;
    }
  }, start);

  var iRebased = rebasedCount;
  this.items.forEach(function (item) {
    var pos = mapping.getMirror(--iRebased);
    if (pos == null) {
      return;
    }
    newUntil = Math.min(newUntil, pos);
    var map = mapping.maps[pos];
    if (item.step) {
      var step = rebasedTransform.steps[pos].invert(rebasedTransform.docs[pos]);
      var selection =
        item.selection && item.selection.map(mapping.slice(iRebased + 1, pos));
      if (selection) {
        eventCount++;
      }
      rebasedItems.push(new Item(map, step, selection));
    } else {
      rebasedItems.push(new Item(map));
    }
  }, start);

  var newMaps = [];
  for (var i = rebasedCount; i < newUntil; i++) {
    newMaps.push(new Item(mapping.maps[i]));
  }
  var items = this.items.slice(0, start).append(newMaps).append(rebasedItems);
  var branch = new Branch(items, eventCount);

  if (branch.emptyItemCount() > max_empty_items) {
    branch = branch.compress(this.items.length - rebasedItems.length);
  }
  return branch;
};

Branch.prototype.emptyItemCount = function emptyItemCount() {
  var count = 0;
  this.items.forEach(function (item) {
    if (!item.step) {
      count++;
    }
  });
  return count;
};

// Compressing a branch means rewriting it to push the air (map-only
// items) out. During collaboration, these naturally accumulate
// because each remote change adds one. The `upto` argument is used
// to ensure that only the items below a given level are compressed,
// because `rebased` relies on a clean, untouched set of items in
// order to associate old items with rebased steps.
Branch.prototype.compress = function compress(upto) {
  if (upto === void 0) upto = this.items.length;

  var remap = this.remapping(0, upto),
    mapFrom = remap.maps.length;
  var items = [],
    events = 0;
  this.items.forEach(
    function (item, i) {
      if (i >= upto) {
        items.push(item);
        if (item.selection) {
          events++;
        }
      } else if (item.step) {
        var step = item.step.map(remap.slice(mapFrom)),
          map = step && step.getMap();
        mapFrom--;
        if (map) {
          remap.appendMap(map, mapFrom);
        }
        if (step) {
          var selection =
            item.selection && item.selection.map(remap.slice(mapFrom));
          if (selection) {
            events++;
          }
          var newItem = new Item(map.invert(), step, selection),
            merged,
            last = items.length - 1;
          if ((merged = items.length && items[last].merge(newItem))) {
            items[last] = merged;
          } else {
            items.push(newItem);
          }
        }
      } else if (item.map) {
        mapFrom--;
      }
    },
    this.items.length,
    0,
  );
  return new Branch(ropeSequence.from(items.reverse()), events);
};

Branch.empty = new Branch(ropeSequence.empty, 0);

function cutOffEvents(items, n) {
  var cutPoint;
  items.forEach(function (item, i) {
    if (item.selection && n-- == 0) {
      cutPoint = i;
      return false;
    }
  });
  return items.slice(cutPoint);
}

var Item = function Item(map, step, selection, mirrorOffset) {
  // The (forward) step map for this item.
  this.map = map;
  // The inverted step
  this.step = step;
  // If this is non-null, this item is the start of a group, and
  // this selection is the starting selection for the group (the one
  // that was active before the first step was applied)
  this.selection = selection;
  // If this item is the inverse of a previous mapping on the stack,
  // this points at the inverse's offset
  this.mirrorOffset = mirrorOffset;
};

Item.prototype.merge = function merge(other) {
  if (this.step && other.step && !other.selection) {
    var step = other.step.merge(this.step);
    if (step) {
      return new Item(step.getMap().invert(), step, this.selection);
    }
  }
};

// The value of the state field that tracks undo/redo history for that
// state. Will be stored in the plugin state when the history plugin
// is active.
var HistoryState = function HistoryState(done, undone, prevRanges, prevTime) {
  this.done = done;
  this.undone = undone;
  this.prevRanges = prevRanges;
  this.prevTime = prevTime;
};

var DEPTH_OVERFLOW = 20;

// : (HistoryState, EditorState, Transaction, Object)
// Record a transformation in undo history.
function applyTransaction(history, state, tr, options) {
  var historyTr = tr.getMeta(historyKey),
    rebased;
  if (historyTr) {
    return historyTr.historyState;
  }

  if (tr.getMeta(closeHistoryKey)) {
    history = new HistoryState(history.done, history.undone, null, 0);
  }

  var appended = tr.getMeta('appendedTransaction');

  if (tr.steps.length == 0) {
    return history;
  } else if (appended && appended.getMeta(historyKey)) {
    if (appended.getMeta(historyKey).redo) {
      return new HistoryState(
        history.done.addTransform(tr, null, options, mustPreserveItems(state)),
        history.undone,
        rangesFor(tr.mapping.maps[tr.steps.length - 1]),
        history.prevTime,
      );
    } else {
      return new HistoryState(
        history.done,
        history.undone.addTransform(
          tr,
          null,
          options,
          mustPreserveItems(state),
        ),
        null,
        history.prevTime,
      );
    }
  } else if (
    tr.getMeta('addToHistory') !== false &&
    !(appended && appended.getMeta('addToHistory') === false)
  ) {
    // Group transforms that occur in quick succession into one event.
    var newGroup =
      history.prevTime == 0 ||
      (!appended &&
        (history.prevTime < (tr.time || 0) - options.newGroupDelay ||
          !isAdjacentTo(tr, history.prevRanges)));
    var prevRanges = appended
      ? mapRanges(history.prevRanges, tr.mapping)
      : rangesFor(tr.mapping.maps[tr.steps.length - 1]);
    return new HistoryState(
      history.done.addTransform(
        tr,
        newGroup ? state.selection.getBookmark() : null,
        options,
        mustPreserveItems(state),
      ),
      Branch.empty,
      prevRanges,
      tr.time,
    );
  } else if ((rebased = tr.getMeta('rebased'))) {
    // Used by the collab module to tell the history that some of its
    // content has been rebased.
    return new HistoryState(
      history.done.rebased(tr, rebased),
      history.undone.rebased(tr, rebased),
      mapRanges(history.prevRanges, tr.mapping),
      history.prevTime,
    );
  } else {
    return new HistoryState(
      history.done.addMaps(tr.mapping.maps),
      history.undone.addMaps(tr.mapping.maps),
      mapRanges(history.prevRanges, tr.mapping),
      history.prevTime,
    );
  }
}

function isAdjacentTo(transform, prevRanges) {
  if (!prevRanges) {
    return false;
  }
  if (!transform.docChanged) {
    return true;
  }
  var adjacent = false;
  transform.mapping.maps[0].forEach(function (start, end) {
    for (var i = 0; i < prevRanges.length; i += 2) {
      if (start <= prevRanges[i + 1] && end >= prevRanges[i]) {
        adjacent = true;
      }
    }
  });
  return adjacent;
}

function rangesFor(map) {
  var result = [];
  map.forEach(function (_from, _to, from, to) {
    return result.push(from, to);
  });
  return result;
}

function mapRanges(ranges, mapping) {
  if (!ranges) {
    return null;
  }
  var result = [];
  for (var i = 0; i < ranges.length; i += 2) {
    var from = mapping.map(ranges[i], 1),
      to = mapping.map(ranges[i + 1], -1);
    if (from <= to) {
      result.push(from, to);
    }
  }
  return result;
}

// : (HistoryState, EditorState, (tr: Transaction), bool)
// Apply the latest event from one branch to the document and shift the event
// onto the other branch.
function histTransaction(history, state, dispatch, redo) {
  var preserveItems = mustPreserveItems(state),
    histOptions = historyKey.get(state).spec.config;
  var pop = (redo ? history.undone : history.done).popEvent(
    state,
    preserveItems,
  );
  if (!pop) {
    return;
  }

  var selection = pop.selection.resolve(pop.transform.doc);
  var added = (redo ? history.done : history.undone).addTransform(
    pop.transform,
    state.selection.getBookmark(),
    histOptions,
    preserveItems,
  );

  var newHist = new HistoryState(
    redo ? added : pop.remaining,
    redo ? pop.remaining : added,
    null,
    0,
  );
  dispatch(
    pop.transform
      .setSelection(selection)
      .setMeta(historyKey, { redo: redo, historyState: newHist })
      .scrollIntoView(),
  );
}

var cachedPreserveItems = false,
  cachedPreserveItemsPlugins = null;
// Check whether any plugin in the given state has a
// `historyPreserveItems` property in its spec, in which case we must
// preserve steps exactly as they came in, so that they can be
// rebased.
function mustPreserveItems(state) {
  var plugins = state.plugins;
  if (cachedPreserveItemsPlugins != plugins) {
    cachedPreserveItems = false;
    cachedPreserveItemsPlugins = plugins;
    for (var i = 0; i < plugins.length; i++) {
      if (plugins[i].spec.historyPreserveItems) {
        cachedPreserveItems = true;
        break;
      }
    }
  }
  return cachedPreserveItems;
}

var historyKey = new PluginKey('history');
var closeHistoryKey = new PluginKey('closeHistory');

// :: (?Object) → Plugin
// Returns a plugin that enables the undo history for an editor. The
// plugin will track undo and redo stacks, which can be used with the
// [`undo`](#history.undo) and [`redo`](#history.redo) commands.
//
// You can set an `"addToHistory"` [metadata
// property](#state.Transaction.setMeta) of `false` on a transaction
// to prevent it from being rolled back by undo.
//
//   config::-
//   Supports the following configuration options:
//
//     depth:: ?number
//     The amount of history events that are collected before the
//     oldest events are discarded. Defaults to 100.
//
//     newGroupDelay:: ?number
//     The delay between changes after which a new group should be
//     started. Defaults to 500 (milliseconds). Note that when changes
//     aren't adjacent, a new group is always started.
function history(config) {
  config = {
    depth: (config && config.depth) || 100,
    newGroupDelay: (config && config.newGroupDelay) || 500,
  };
  return new Plugin({
    key: historyKey,

    state: {
      init: function init() {
        return new HistoryState(Branch.empty, Branch.empty, null, 0);
      },
      apply: function apply(tr, hist, state) {
        return applyTransaction(hist, state, tr, config);
      },
    },

    config: config,
  });
}

// :: (EditorState, ?(tr: Transaction)) → bool
// A command function that undoes the last change, if any.
function undo(state, dispatch) {
  var hist = historyKey.getState(state);
  if (!hist || hist.done.eventCount == 0) {
    return false;
  }
  if (dispatch) {
    histTransaction(hist, state, dispatch, false);
  }
  return true;
}

// :: (EditorState, ?(tr: Transaction)) → bool
// A command function that redoes the last undone change, if any.
function redo(state, dispatch) {
  var hist = historyKey.getState(state);
  if (!hist || hist.undone.eventCount == 0) {
    return false;
  }
  if (dispatch) {
    histTransaction(hist, state, dispatch, true);
  }
  return true;
}

// :: (EditorState, ?(tr: Transaction)) → bool
// Delete the selection, if there is one.
function deleteSelection(state, dispatch) {
  if (state.selection.empty) {
    return false;
  }
  if (dispatch) {
    dispatch(state.tr.deleteSelection().scrollIntoView());
  }
  return true;
}

// :: (EditorState, ?(tr: Transaction), ?EditorView) → bool
// If the selection is empty and at the start of a textblock, try to
// reduce the distance between that block and the one before it—if
// there's a block directly before it that can be joined, join them.
// If not, try to move the selected block closer to the next one in
// the document structure by lifting it out of its parent or moving it
// into a parent of the previous block. Will use the view for accurate
// (bidi-aware) start-of-textblock detection if given.
function joinBackward(state, dispatch, view) {
  var ref = state.selection;
  var $cursor = ref.$cursor;
  if (
    !$cursor ||
    (view ? !view.endOfTextblock('backward', state) : $cursor.parentOffset > 0)
  ) {
    return false;
  }

  var $cut = findCutBefore($cursor);

  // If there is no node before this, try to lift
  if (!$cut) {
    var range = $cursor.blockRange(),
      target = range && liftTarget(range);
    if (target == null) {
      return false;
    }
    if (dispatch) {
      dispatch(state.tr.lift(range, target).scrollIntoView());
    }
    return true;
  }

  var before = $cut.nodeBefore;
  // Apply the joining algorithm
  if (!before.type.spec.isolating && deleteBarrier(state, $cut, dispatch)) {
    return true;
  }

  // If the node below has no content and the node above is
  // selectable, delete the node below and select the one above.
  if (
    $cursor.parent.content.size == 0 &&
    (textblockAt(before, 'end') || NodeSelection.isSelectable(before))
  ) {
    if (dispatch) {
      var tr = state.tr.deleteRange($cursor.before(), $cursor.after());
      tr.setSelection(
        textblockAt(before, 'end')
          ? Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos, -1)), -1)
          : NodeSelection.create(tr.doc, $cut.pos - before.nodeSize),
      );
      dispatch(tr.scrollIntoView());
    }
    return true;
  }

  // If the node before is an atom, delete it
  if (before.isAtom && $cut.depth == $cursor.depth - 1) {
    if (dispatch) {
      dispatch(
        state.tr.delete($cut.pos - before.nodeSize, $cut.pos).scrollIntoView(),
      );
    }
    return true;
  }

  return false;
}

function textblockAt(node, side) {
  for (; node; node = side == 'start' ? node.firstChild : node.lastChild) {
    if (node.isTextblock) {
      return true;
    }
  }
  return false;
}

// :: (EditorState, ?(tr: Transaction), ?EditorView) → bool
// When the selection is empty and at the start of a textblock, select
// the node before that textblock, if possible. This is intended to be
// bound to keys like backspace, after
// [`joinBackward`](#commands.joinBackward) or other deleting
// commands, as a fall-back behavior when the schema doesn't allow
// deletion at the selected point.
function selectNodeBackward(state, dispatch, view) {
  var ref = state.selection;
  var $head = ref.$head;
  var empty = ref.empty;
  var $cut = $head;
  if (!empty) {
    return false;
  }

  if ($head.parent.isTextblock) {
    if (
      view ? !view.endOfTextblock('backward', state) : $head.parentOffset > 0
    ) {
      return false;
    }
    $cut = findCutBefore($head);
  }
  var node = $cut && $cut.nodeBefore;
  if (!node || !NodeSelection.isSelectable(node)) {
    return false;
  }
  if (dispatch) {
    dispatch(
      state.tr
        .setSelection(NodeSelection.create(state.doc, $cut.pos - node.nodeSize))
        .scrollIntoView(),
    );
  }
  return true;
}

function findCutBefore($pos) {
  if (!$pos.parent.type.spec.isolating) {
    for (var i = $pos.depth - 1; i >= 0; i--) {
      if ($pos.index(i) > 0) {
        return $pos.doc.resolve($pos.before(i + 1));
      }
      if ($pos.node(i).type.spec.isolating) {
        break;
      }
    }
  }
  return null;
}

// :: (EditorState, ?(tr: Transaction), ?EditorView) → bool
// If the selection is empty and the cursor is at the end of a
// textblock, try to reduce or remove the boundary between that block
// and the one after it, either by joining them or by moving the other
// block closer to this one in the tree structure. Will use the view
// for accurate start-of-textblock detection if given.
function joinForward(state, dispatch, view) {
  var ref = state.selection;
  var $cursor = ref.$cursor;
  if (
    !$cursor ||
    (view
      ? !view.endOfTextblock('forward', state)
      : $cursor.parentOffset < $cursor.parent.content.size)
  ) {
    return false;
  }

  var $cut = findCutAfter($cursor);

  // If there is no node after this, there's nothing to do
  if (!$cut) {
    return false;
  }

  var after = $cut.nodeAfter;
  // Try the joining algorithm
  if (deleteBarrier(state, $cut, dispatch)) {
    return true;
  }

  // If the node above has no content and the node below is
  // selectable, delete the node above and select the one below.
  if (
    $cursor.parent.content.size == 0 &&
    (textblockAt(after, 'start') || NodeSelection.isSelectable(after))
  ) {
    if (dispatch) {
      var tr = state.tr.deleteRange($cursor.before(), $cursor.after());
      tr.setSelection(
        textblockAt(after, 'start')
          ? Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos)), 1)
          : NodeSelection.create(tr.doc, tr.mapping.map($cut.pos)),
      );
      dispatch(tr.scrollIntoView());
    }
    return true;
  }

  // If the next node is an atom, delete it
  if (after.isAtom && $cut.depth == $cursor.depth - 1) {
    if (dispatch) {
      dispatch(
        state.tr.delete($cut.pos, $cut.pos + after.nodeSize).scrollIntoView(),
      );
    }
    return true;
  }

  return false;
}

// :: (EditorState, ?(tr: Transaction), ?EditorView) → bool
// When the selection is empty and at the end of a textblock, select
// the node coming after that textblock, if possible. This is intended
// to be bound to keys like delete, after
// [`joinForward`](#commands.joinForward) and similar deleting
// commands, to provide a fall-back behavior when the schema doesn't
// allow deletion at the selected point.
function selectNodeForward(state, dispatch, view) {
  var ref = state.selection;
  var $head = ref.$head;
  var empty = ref.empty;
  var $cut = $head;
  if (!empty) {
    return false;
  }
  if ($head.parent.isTextblock) {
    if (
      view
        ? !view.endOfTextblock('forward', state)
        : $head.parentOffset < $head.parent.content.size
    ) {
      return false;
    }
    $cut = findCutAfter($head);
  }
  var node = $cut && $cut.nodeAfter;
  if (!node || !NodeSelection.isSelectable(node)) {
    return false;
  }
  if (dispatch) {
    dispatch(
      state.tr
        .setSelection(NodeSelection.create(state.doc, $cut.pos))
        .scrollIntoView(),
    );
  }
  return true;
}

function findCutAfter($pos) {
  if (!$pos.parent.type.spec.isolating) {
    for (var i = $pos.depth - 1; i >= 0; i--) {
      var parent = $pos.node(i);
      if ($pos.index(i) + 1 < parent.childCount) {
        return $pos.doc.resolve($pos.after(i + 1));
      }
      if (parent.type.spec.isolating) {
        break;
      }
    }
  }
  return null;
}

// :: (EditorState, ?(tr: Transaction)) → bool
// Join the selected block or, if there is a text selection, the
// closest ancestor block of the selection that can be joined, with
// the sibling above it.
function joinUp(state, dispatch) {
  var sel = state.selection,
    nodeSel = sel instanceof NodeSelection,
    point;
  if (nodeSel) {
    if (sel.node.isTextblock || !canJoin(state.doc, sel.from)) {
      return false;
    }
    point = sel.from;
  } else {
    point = joinPoint(state.doc, sel.from, -1);
    if (point == null) {
      return false;
    }
  }
  if (dispatch) {
    var tr = state.tr.join(point);
    if (nodeSel) {
      tr.setSelection(
        NodeSelection.create(
          tr.doc,
          point - state.doc.resolve(point).nodeBefore.nodeSize,
        ),
      );
    }
    dispatch(tr.scrollIntoView());
  }
  return true;
}

// :: (EditorState, ?(tr: Transaction)) → bool
// Join the selected block, or the closest ancestor of the selection
// that can be joined, with the sibling after it.
function joinDown(state, dispatch) {
  var sel = state.selection,
    point;
  if (sel instanceof NodeSelection) {
    if (sel.node.isTextblock || !canJoin(state.doc, sel.to)) {
      return false;
    }
    point = sel.to;
  } else {
    point = joinPoint(state.doc, sel.to, 1);
    if (point == null) {
      return false;
    }
  }
  if (dispatch) {
    dispatch(state.tr.join(point).scrollIntoView());
  }
  return true;
}

// :: (EditorState, ?(tr: Transaction)) → bool
// Lift the selected block, or the closest ancestor block of the
// selection that can be lifted, out of its parent node.
function lift(state, dispatch) {
  var ref = state.selection;
  var $from = ref.$from;
  var $to = ref.$to;
  var range = $from.blockRange($to),
    target = range && liftTarget(range);
  if (target == null) {
    return false;
  }
  if (dispatch) {
    dispatch(state.tr.lift(range, target).scrollIntoView());
  }
  return true;
}

// :: (EditorState, ?(tr: Transaction)) → bool
// If the selection is in a node whose type has a truthy
// [`code`](#model.NodeSpec.code) property in its spec, replace the
// selection with a newline character.
function newlineInCode(state, dispatch) {
  var ref = state.selection;
  var $head = ref.$head;
  var $anchor = ref.$anchor;
  if (!$head.parent.type.spec.code || !$head.sameParent($anchor)) {
    return false;
  }
  if (dispatch) {
    dispatch(state.tr.insertText('\n').scrollIntoView());
  }
  return true;
}

function defaultBlockAt(match) {
  for (var i = 0; i < match.edgeCount; i++) {
    var ref = match.edge(i);
    var type = ref.type;
    if (type.isTextblock && !type.hasRequiredAttrs()) {
      return type;
    }
  }
  return null;
}

// :: (EditorState, ?(tr: Transaction)) → bool
// When the selection is in a node with a truthy
// [`code`](#model.NodeSpec.code) property in its spec, create a
// default block after the code block, and move the cursor there.
function exitCode(state, dispatch) {
  var ref = state.selection;
  var $head = ref.$head;
  var $anchor = ref.$anchor;
  if (!$head.parent.type.spec.code || !$head.sameParent($anchor)) {
    return false;
  }
  var above = $head.node(-1),
    after = $head.indexAfter(-1),
    type = defaultBlockAt(above.contentMatchAt(after));
  if (!above.canReplaceWith(after, after, type)) {
    return false;
  }
  if (dispatch) {
    var pos = $head.after(),
      tr = state.tr.replaceWith(pos, pos, type.createAndFill());
    tr.setSelection(Selection.near(tr.doc.resolve(pos), 1));
    dispatch(tr.scrollIntoView());
  }
  return true;
}

// :: (EditorState, ?(tr: Transaction)) → bool
// If a block node is selected, create an empty paragraph before (if
// it is its parent's first child) or after it.
function createParagraphNear(state, dispatch) {
  var sel = state.selection;
  var $from = sel.$from;
  var $to = sel.$to;
  if (
    sel instanceof AllSelection ||
    $from.parent.inlineContent ||
    $to.parent.inlineContent
  ) {
    return false;
  }
  var type = defaultBlockAt($to.parent.contentMatchAt($to.indexAfter()));
  if (!type || !type.isTextblock) {
    return false;
  }
  if (dispatch) {
    var side = (!$from.parentOffset && $to.index() < $to.parent.childCount
      ? $from
      : $to
    ).pos;
    var tr = state.tr.insert(side, type.createAndFill());
    tr.setSelection(TextSelection.create(tr.doc, side + 1));
    dispatch(tr.scrollIntoView());
  }
  return true;
}

// :: (EditorState, ?(tr: Transaction)) → bool
// If the cursor is in an empty textblock that can be lifted, lift the
// block.
function liftEmptyBlock(state, dispatch) {
  var ref = state.selection;
  var $cursor = ref.$cursor;
  if (!$cursor || $cursor.parent.content.size) {
    return false;
  }
  if ($cursor.depth > 1 && $cursor.after() != $cursor.end(-1)) {
    var before = $cursor.before();
    if (canSplit(state.doc, before)) {
      if (dispatch) {
        dispatch(state.tr.split(before).scrollIntoView());
      }
      return true;
    }
  }
  var range = $cursor.blockRange(),
    target = range && liftTarget(range);
  if (target == null) {
    return false;
  }
  if (dispatch) {
    dispatch(state.tr.lift(range, target).scrollIntoView());
  }
  return true;
}

// :: (EditorState, ?(tr: Transaction)) → bool
// Split the parent block of the selection. If the selection is a text
// selection, also delete its content.
function splitBlock(state, dispatch) {
  var ref = state.selection;
  var $from = ref.$from;
  var $to = ref.$to;
  if (
    state.selection instanceof NodeSelection &&
    state.selection.node.isBlock
  ) {
    if (!$from.parentOffset || !canSplit(state.doc, $from.pos)) {
      return false;
    }
    if (dispatch) {
      dispatch(state.tr.split($from.pos).scrollIntoView());
    }
    return true;
  }

  if (!$from.parent.isBlock) {
    return false;
  }

  if (dispatch) {
    var atEnd = $to.parentOffset == $to.parent.content.size;
    var tr = state.tr;
    if (
      state.selection instanceof TextSelection ||
      state.selection instanceof AllSelection
    ) {
      tr.deleteSelection();
    }
    var deflt =
      $from.depth == 0
        ? null
        : defaultBlockAt($from.node(-1).contentMatchAt($from.indexAfter(-1)));
    var types = atEnd && deflt ? [{ type: deflt }] : null;
    var can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types);
    if (
      !types &&
      !can &&
      canSplit(tr.doc, tr.mapping.map($from.pos), 1, deflt && [{ type: deflt }])
    ) {
      types = [{ type: deflt }];
      can = true;
    }
    if (can) {
      tr.split(tr.mapping.map($from.pos), 1, types);
      if (
        !atEnd &&
        !$from.parentOffset &&
        $from.parent.type != deflt &&
        $from
          .node(-1)
          .canReplace(
            $from.index(-1),
            $from.indexAfter(-1),
            Fragment.from([deflt.create(), $from.parent]),
          )
      ) {
        tr.setNodeMarkup(tr.mapping.map($from.before()), deflt);
      }
    }
    dispatch(tr.scrollIntoView());
  }
  return true;
}

// :: (EditorState, ?(tr: Transaction)) → bool
// Move the selection to the node wrapping the current selection, if
// any. (Will not select the document node.)
function selectParentNode(state, dispatch) {
  var ref = state.selection;
  var $from = ref.$from;
  var to = ref.to;
  var pos;
  var same = $from.sharedDepth(to);
  if (same == 0) {
    return false;
  }
  pos = $from.before(same);
  if (dispatch) {
    dispatch(state.tr.setSelection(NodeSelection.create(state.doc, pos)));
  }
  return true;
}

// :: (EditorState, ?(tr: Transaction)) → bool
// Select the whole document.
function selectAll(state, dispatch) {
  if (dispatch) {
    dispatch(state.tr.setSelection(new AllSelection(state.doc)));
  }
  return true;
}

function joinMaybeClear(state, $pos, dispatch) {
  var before = $pos.nodeBefore,
    after = $pos.nodeAfter,
    index = $pos.index();
  if (!before || !after || !before.type.compatibleContent(after.type)) {
    return false;
  }
  if (!before.content.size && $pos.parent.canReplace(index - 1, index)) {
    if (dispatch) {
      dispatch(
        state.tr.delete($pos.pos - before.nodeSize, $pos.pos).scrollIntoView(),
      );
    }
    return true;
  }
  if (
    !$pos.parent.canReplace(index, index + 1) ||
    !(after.isTextblock || canJoin(state.doc, $pos.pos))
  ) {
    return false;
  }
  if (dispatch) {
    dispatch(
      state.tr
        .clearIncompatible(
          $pos.pos,
          before.type,
          before.contentMatchAt(before.childCount),
        )
        .join($pos.pos)
        .scrollIntoView(),
    );
  }
  return true;
}

function deleteBarrier(state, $cut, dispatch) {
  var before = $cut.nodeBefore,
    after = $cut.nodeAfter,
    conn,
    match;
  if (before.type.spec.isolating || after.type.spec.isolating) {
    return false;
  }
  if (joinMaybeClear(state, $cut, dispatch)) {
    return true;
  }

  var canDelAfter = $cut.parent.canReplace($cut.index(), $cut.index() + 1);
  if (
    canDelAfter &&
    (conn = (match = before.contentMatchAt(before.childCount)).findWrapping(
      after.type,
    )) &&
    match.matchType(conn[0] || after.type).validEnd
  ) {
    if (dispatch) {
      var end = $cut.pos + after.nodeSize,
        wrap = Fragment.empty;
      for (var i = conn.length - 1; i >= 0; i--) {
        wrap = Fragment.from(conn[i].create(null, wrap));
      }
      wrap = Fragment.from(before.copy(wrap));
      var tr = state.tr.step(
        new ReplaceAroundStep(
          $cut.pos - 1,
          end,
          $cut.pos,
          end,
          new Slice(wrap, 1, 0),
          conn.length,
          true,
        ),
      );
      var joinAt = end + 2 * conn.length;
      if (canJoin(tr.doc, joinAt)) {
        tr.join(joinAt);
      }
      dispatch(tr.scrollIntoView());
    }
    return true;
  }

  var selAfter = Selection.findFrom($cut, 1);
  var range = selAfter && selAfter.$from.blockRange(selAfter.$to),
    target = range && liftTarget(range);
  if (target != null && target >= $cut.depth) {
    if (dispatch) {
      dispatch(state.tr.lift(range, target).scrollIntoView());
    }
    return true;
  }

  if (canDelAfter && after.isTextblock && textblockAt(before, 'end')) {
    var at = before,
      wrap$1 = [];
    for (;;) {
      wrap$1.push(at);
      if (at.isTextblock) {
        break;
      }
      at = at.lastChild;
    }
    if (at.canReplace(at.childCount, at.childCount, after.content)) {
      if (dispatch) {
        var end$1 = Fragment.empty;
        for (var i$1 = wrap$1.length - 1; i$1 >= 0; i$1--) {
          end$1 = Fragment.from(wrap$1[i$1].copy(end$1));
        }
        var tr$1 = state.tr.step(
          new ReplaceAroundStep(
            $cut.pos - wrap$1.length,
            $cut.pos + after.nodeSize,
            $cut.pos + 1,
            $cut.pos + after.nodeSize - 1,
            new Slice(end$1, wrap$1.length, 0),
            0,
            true,
          ),
        );
        dispatch(tr$1.scrollIntoView());
      }
      return true;
    }
  }

  return false;
}

// Parameterized commands

// :: (NodeType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Wrap the selection in a node of the given type with the given
// attributes.
function wrapIn(nodeType, attrs) {
  return function (state, dispatch) {
    var ref = state.selection;
    var $from = ref.$from;
    var $to = ref.$to;
    var range = $from.blockRange($to),
      wrapping = range && findWrapping(range, nodeType, attrs);
    if (!wrapping) {
      return false;
    }
    if (dispatch) {
      dispatch(state.tr.wrap(range, wrapping).scrollIntoView());
    }
    return true;
  };
}

// :: (NodeType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Returns a command that tries to set the selected textblocks to the
// given node type with the given attributes.
function setBlockType(nodeType, attrs) {
  return function (state, dispatch) {
    var ref = state.selection;
    var from = ref.from;
    var to = ref.to;
    var applicable = false;
    state.doc.nodesBetween(from, to, function (node, pos) {
      if (applicable) {
        return false;
      }
      if (!node.isTextblock || node.hasMarkup(nodeType, attrs)) {
        return;
      }
      if (node.type == nodeType) {
        applicable = true;
      } else {
        var $pos = state.doc.resolve(pos),
          index = $pos.index();
        applicable = $pos.parent.canReplaceWith(index, index + 1, nodeType);
      }
    });
    if (!applicable) {
      return false;
    }
    if (dispatch) {
      dispatch(
        state.tr.setBlockType(from, to, nodeType, attrs).scrollIntoView(),
      );
    }
    return true;
  };
}

function markApplies(doc, ranges, type) {
  var loop = function (i) {
    var ref = ranges[i];
    var $from = ref.$from;
    var $to = ref.$to;
    var can = $from.depth == 0 ? doc.type.allowsMarkType(type) : false;
    doc.nodesBetween($from.pos, $to.pos, function (node) {
      if (can) {
        return false;
      }
      can = node.inlineContent && node.type.allowsMarkType(type);
    });
    if (can) {
      return { v: true };
    }
  };

  for (var i = 0; i < ranges.length; i++) {
    var returned = loop(i);

    if (returned) return returned.v;
  }
  return false;
}

// :: (MarkType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Create a command function that toggles the given mark with the
// given attributes. Will return `false` when the current selection
// doesn't support that mark. This will remove the mark if any marks
// of that type exist in the selection, or add it otherwise. If the
// selection is empty, this applies to the [stored
// marks](#state.EditorState.storedMarks) instead of a range of the
// document.
function toggleMark(markType, attrs) {
  return function (state, dispatch) {
    var ref = state.selection;
    var empty = ref.empty;
    var $cursor = ref.$cursor;
    var ranges = ref.ranges;
    if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) {
      return false;
    }
    if (dispatch) {
      if ($cursor) {
        if (markType.isInSet(state.storedMarks || $cursor.marks())) {
          dispatch(state.tr.removeStoredMark(markType));
        } else {
          dispatch(state.tr.addStoredMark(markType.create(attrs)));
        }
      } else {
        var has = false,
          tr = state.tr;
        for (var i = 0; !has && i < ranges.length; i++) {
          var ref$1 = ranges[i];
          var $from = ref$1.$from;
          var $to = ref$1.$to;
          has = state.doc.rangeHasMark($from.pos, $to.pos, markType);
        }
        for (var i$1 = 0; i$1 < ranges.length; i$1++) {
          var ref$2 = ranges[i$1];
          var $from$1 = ref$2.$from;
          var $to$1 = ref$2.$to;
          if (has) {
            tr.removeMark($from$1.pos, $to$1.pos, markType);
          } else {
            var from = $from$1.pos,
              to = $to$1.pos,
              start = $from$1.nodeAfter,
              end = $to$1.nodeBefore;
            var spaceStart =
              start && start.isText ? /^\s*/.exec(start.text)[0].length : 0;
            var spaceEnd =
              end && end.isText ? /\s*$/.exec(end.text)[0].length : 0;
            if (from + spaceStart < to) {
              from += spaceStart;
              to -= spaceEnd;
            }
            tr.addMark(from, to, markType.create(attrs));
          }
        }
        dispatch(tr.scrollIntoView());
      }
    }
    return true;
  };
}

// :: (...[(EditorState, ?(tr: Transaction), ?EditorView) → bool]) → (EditorState, ?(tr: Transaction), ?EditorView) → bool
// Combine a number of command functions into a single function (which
// calls them one by one until one returns true).
function chainCommands() {
  var commands = [],
    len = arguments.length;
  while (len--) commands[len] = arguments[len];

  return function (state, dispatch, view) {
    for (var i = 0; i < commands.length; i++) {
      if (commands[i](state, dispatch, view)) {
        return true;
      }
    }
    return false;
  };
}

var backspace = chainCommands(
  deleteSelection,
  joinBackward,
  selectNodeBackward,
);
var del = chainCommands(deleteSelection, joinForward, selectNodeForward);

// :: Object
// A basic keymap containing bindings not specific to any schema.
// Binds the following keys (when multiple commands are listed, they
// are chained with [`chainCommands`](#commands.chainCommands)):
//
// * **Enter** to `newlineInCode`, `createParagraphNear`, `liftEmptyBlock`, `splitBlock`
// * **Mod-Enter** to `exitCode`
// * **Backspace** and **Mod-Backspace** to `deleteSelection`, `joinBackward`, `selectNodeBackward`
// * **Delete** and **Mod-Delete** to `deleteSelection`, `joinForward`, `selectNodeForward`
// * **Mod-Delete** to `deleteSelection`, `joinForward`, `selectNodeForward`
// * **Mod-a** to `selectAll`
var pcBaseKeymap = {
  Enter: chainCommands(
    newlineInCode,
    createParagraphNear,
    liftEmptyBlock,
    splitBlock,
  ),
  'Mod-Enter': exitCode,
  Backspace: backspace,
  'Mod-Backspace': backspace,
  Delete: del,
  'Mod-Delete': del,
  'Mod-a': selectAll,
};

// :: Object
// A copy of `pcBaseKeymap` that also binds **Ctrl-h** like Backspace,
// **Ctrl-d** like Delete, **Alt-Backspace** like Ctrl-Backspace, and
// **Ctrl-Alt-Backspace**, **Alt-Delete**, and **Alt-d** like
// Ctrl-Delete.
var macBaseKeymap = {
  'Ctrl-h': pcBaseKeymap['Backspace'],
  'Alt-Backspace': pcBaseKeymap['Mod-Backspace'],
  'Ctrl-d': pcBaseKeymap['Delete'],
  'Ctrl-Alt-Backspace': pcBaseKeymap['Mod-Delete'],
  'Alt-Delete': pcBaseKeymap['Mod-Delete'],
  'Alt-d': pcBaseKeymap['Mod-Delete'],
};
for (var key in pcBaseKeymap) {
  macBaseKeymap[key] = pcBaseKeymap[key];
}

// declare global: os, navigator
var mac$1 =
  typeof navigator != 'undefined'
    ? /Mac/.test(navigator.platform)
    : typeof os != 'undefined'
    ? os.platform() == 'darwin'
    : false;

// :: Object
// Depending on the detected platform, this will hold
// [`pcBasekeymap`](#commands.pcBaseKeymap) or
// [`macBaseKeymap`](#commands.macBaseKeymap).
var baseKeymap = mac$1 ? macBaseKeymap : pcBaseKeymap;

// :: (options: ?Object) → Plugin
// Create a plugin that, when added to a ProseMirror instance,
// causes a decoration to show up at the drop position when something
// is dragged over the editor.
//
//   options::- These options are supported:
//
//     color:: ?string
//     The color of the cursor. Defaults to `black`.
//
//     width:: ?number
//     The precise width of the cursor in pixels. Defaults to 1.
//
//     class:: ?string
//     A CSS class name to add to the cursor element.
function dropCursor(options) {
  if (options === void 0) options = {};

  return new Plugin({
    view: function view(editorView) {
      return new DropCursorView(editorView, options);
    },
  });
}

var DropCursorView = function DropCursorView(editorView, options) {
  var this$1 = this;

  this.editorView = editorView;
  this.width = options.width || 1;
  this.color = options.color || 'black';
  this.class = options.class;
  this.cursorPos = null;
  this.element = null;
  this.timeout = null;

  this.handlers = ['dragover', 'dragend', 'drop', 'dragleave'].map(function (
    name,
  ) {
    var handler = function (e) {
      return this$1[name](e);
    };
    editorView.dom.addEventListener(name, handler);
    return { name: name, handler: handler };
  });
};

DropCursorView.prototype.destroy = function destroy() {
  var this$1 = this;

  this.handlers.forEach(function (ref) {
    var name = ref.name;
    var handler = ref.handler;

    return this$1.editorView.dom.removeEventListener(name, handler);
  });
};

DropCursorView.prototype.update = function update(editorView, prevState) {
  if (this.cursorPos != null && prevState.doc != editorView.state.doc) {
    this.updateOverlay();
  }
};

DropCursorView.prototype.setCursor = function setCursor(pos) {
  if (pos == this.cursorPos) {
    return;
  }
  this.cursorPos = pos;
  if (pos == null) {
    this.element.parentNode.removeChild(this.element);
    this.element = null;
  } else {
    this.updateOverlay();
  }
};

DropCursorView.prototype.updateOverlay = function updateOverlay() {
  var $pos = this.editorView.state.doc.resolve(this.cursorPos),
    rect;
  if (!$pos.parent.inlineContent) {
    var before = $pos.nodeBefore,
      after = $pos.nodeAfter;
    if (before || after) {
      var nodeRect = this.editorView
        .nodeDOM(this.cursorPos - (before ? before.nodeSize : 0))
        .getBoundingClientRect();
      var top = before ? nodeRect.bottom : nodeRect.top;
      if (before && after) {
        top =
          (top +
            this.editorView.nodeDOM(this.cursorPos).getBoundingClientRect()
              .top) /
          2;
      }
      rect = {
        left: nodeRect.left,
        right: nodeRect.right,
        top: top - this.width / 2,
        bottom: top + this.width / 2,
      };
    }
  }
  if (!rect) {
    var coords = this.editorView.coordsAtPos(this.cursorPos);
    rect = {
      left: coords.left - this.width / 2,
      right: coords.left + this.width / 2,
      top: coords.top,
      bottom: coords.bottom,
    };
  }

  var parent = this.editorView.dom.offsetParent;
  if (!this.element) {
    this.element = parent.appendChild(document.createElement('div'));
    if (this.class) {
      this.element.className = this.class;
    }
    this.element.style.cssText =
      'position: absolute; z-index: 50; pointer-events: none; background-color: ' +
      this.color;
  }
  var parentLeft, parentTop;
  if (
    !parent ||
    (parent == document.body && getComputedStyle(parent).position == 'static')
  ) {
    parentLeft = -pageXOffset;
    parentTop = -pageYOffset;
  } else {
    var rect$1 = parent.getBoundingClientRect();
    parentLeft = rect$1.left - parent.scrollLeft;
    parentTop = rect$1.top - parent.scrollTop;
  }
  this.element.style.left = rect.left - parentLeft + 'px';
  this.element.style.top = rect.top - parentTop + 'px';
  this.element.style.width = rect.right - rect.left + 'px';
  this.element.style.height = rect.bottom - rect.top + 'px';
};

DropCursorView.prototype.scheduleRemoval = function scheduleRemoval(timeout) {
  var this$1 = this;

  clearTimeout(this.timeout);
  this.timeout = setTimeout(function () {
    return this$1.setCursor(null);
  }, timeout);
};

DropCursorView.prototype.dragover = function dragover(event) {
  if (!this.editorView.editable) {
    return;
  }
  var pos = this.editorView.posAtCoords({
    left: event.clientX,
    top: event.clientY,
  });
  if (pos) {
    var target = pos.pos;
    if (this.editorView.dragging && this.editorView.dragging.slice) {
      target = dropPoint(
        this.editorView.state.doc,
        target,
        this.editorView.dragging.slice,
      );
      if (target == null) {
        target = pos.pos;
      }
    }
    this.setCursor(target);
    this.scheduleRemoval(5000);
  }
};

DropCursorView.prototype.dragend = function dragend() {
  this.scheduleRemoval(20);
};

DropCursorView.prototype.drop = function drop() {
  this.scheduleRemoval(20);
};

DropCursorView.prototype.dragleave = function dragleave(event) {
  if (
    event.target == this.editorView.dom ||
    !this.editorView.dom.contains(event.relatedTarget)
  ) {
    this.setCursor(null);
  }
};

// ::- Gap cursor selections are represented using this class. Its
// `$anchor` and `$head` properties both point at the cursor position.
var GapCursor = /*@__PURE__*/ (function (Selection) {
  function GapCursor($pos) {
    Selection.call(this, $pos, $pos);
  }

  if (Selection) GapCursor.__proto__ = Selection;
  GapCursor.prototype = Object.create(Selection && Selection.prototype);
  GapCursor.prototype.constructor = GapCursor;

  GapCursor.prototype.map = function map(doc, mapping) {
    var $pos = doc.resolve(mapping.map(this.head));
    return GapCursor.valid($pos) ? new GapCursor($pos) : Selection.near($pos);
  };

  GapCursor.prototype.content = function content() {
    return Slice.empty;
  };

  GapCursor.prototype.eq = function eq(other) {
    return other instanceof GapCursor && other.head == this.head;
  };

  GapCursor.prototype.toJSON = function toJSON() {
    return { type: 'gapcursor', pos: this.head };
  };

  GapCursor.fromJSON = function fromJSON(doc, json) {
    if (typeof json.pos != 'number') {
      throw new RangeError('Invalid input for GapCursor.fromJSON');
    }
    return new GapCursor(doc.resolve(json.pos));
  };

  GapCursor.prototype.getBookmark = function getBookmark() {
    return new GapBookmark(this.anchor);
  };

  GapCursor.valid = function valid($pos) {
    var parent = $pos.parent;
    if (parent.isTextblock || !closedBefore($pos) || !closedAfter($pos)) {
      return false;
    }
    var override = parent.type.spec.allowGapCursor;
    if (override != null) {
      return override;
    }
    var deflt = parent.contentMatchAt($pos.index()).defaultType;
    return deflt && deflt.isTextblock;
  };

  GapCursor.findFrom = function findFrom($pos, dir, mustMove) {
    search: for (;;) {
      if (!mustMove && GapCursor.valid($pos)) {
        return $pos;
      }
      var pos = $pos.pos,
        next = null;
      // Scan up from this position
      for (var d = $pos.depth; ; d--) {
        var parent = $pos.node(d);
        if (
          dir > 0 ? $pos.indexAfter(d) < parent.childCount : $pos.index(d) > 0
        ) {
          next = parent.child(dir > 0 ? $pos.indexAfter(d) : $pos.index(d) - 1);
          break;
        } else if (d == 0) {
          return null;
        }
        pos += dir;
        var $cur = $pos.doc.resolve(pos);
        if (GapCursor.valid($cur)) {
          return $cur;
        }
      }

      // And then down into the next node
      for (;;) {
        var inside = dir > 0 ? next.firstChild : next.lastChild;
        if (!inside) {
          if (
            next.isAtom &&
            !next.isText &&
            !NodeSelection.isSelectable(next)
          ) {
            $pos = $pos.doc.resolve(pos + next.nodeSize * dir);
            mustMove = false;
            continue search;
          }
          break;
        }
        next = inside;
        pos += dir;
        var $cur$1 = $pos.doc.resolve(pos);
        if (GapCursor.valid($cur$1)) {
          return $cur$1;
        }
      }

      return null;
    }
  };

  return GapCursor;
})(Selection);

GapCursor.prototype.visible = false;

Selection.jsonID('gapcursor', GapCursor);

var GapBookmark = function GapBookmark(pos) {
  this.pos = pos;
};
GapBookmark.prototype.map = function map(mapping) {
  return new GapBookmark(mapping.map(this.pos));
};
GapBookmark.prototype.resolve = function resolve(doc) {
  var $pos = doc.resolve(this.pos);
  return GapCursor.valid($pos) ? new GapCursor($pos) : Selection.near($pos);
};

function closedBefore($pos) {
  for (var d = $pos.depth; d >= 0; d--) {
    var index = $pos.index(d);
    // At the start of this parent, look at next one
    if (index == 0) {
      continue;
    }
    // See if the node before (or its first ancestor) is closed
    for (
      var before = $pos.node(d).child(index - 1);
      ;
      before = before.lastChild
    ) {
      if (
        (before.childCount == 0 && !before.inlineContent) ||
        before.isAtom ||
        before.type.spec.isolating
      ) {
        return true;
      }
      if (before.inlineContent) {
        return false;
      }
    }
  }
  // Hit start of document
  return true;
}

function closedAfter($pos) {
  for (var d = $pos.depth; d >= 0; d--) {
    var index = $pos.indexAfter(d),
      parent = $pos.node(d);
    if (index == parent.childCount) {
      continue;
    }
    for (var after = parent.child(index); ; after = after.firstChild) {
      if (
        (after.childCount == 0 && !after.inlineContent) ||
        after.isAtom ||
        after.type.spec.isolating
      ) {
        return true;
      }
      if (after.inlineContent) {
        return false;
      }
    }
  }
  return true;
}

// :: () → Plugin
// Create a gap cursor plugin. When enabled, this will capture clicks
// near and arrow-key-motion past places that don't have a normally
// selectable position nearby, and create a gap cursor selection for
// them. The cursor is drawn as an element with class
// `ProseMirror-gapcursor`. You can either include
// `style/gapcursor.css` from the package's directory or add your own
// styles to make it visible.
var gapCursor = function () {
  return new Plugin({
    props: {
      decorations: drawGapCursor,

      createSelectionBetween: function createSelectionBetween(
        _view,
        $anchor,
        $head,
      ) {
        if ($anchor.pos == $head.pos && GapCursor.valid($head)) {
          return new GapCursor($head);
        }
      },

      handleClick: handleClick,
      handleKeyDown: handleKeyDown,
    },
  });
};

var handleKeyDown = keydownHandler({
  ArrowLeft: arrow('horiz', -1),
  ArrowRight: arrow('horiz', 1),
  ArrowUp: arrow('vert', -1),
  ArrowDown: arrow('vert', 1),
});

function arrow(axis, dir) {
  var dirStr =
    axis == 'vert' ? (dir > 0 ? 'down' : 'up') : dir > 0 ? 'right' : 'left';
  return function (state, dispatch, view) {
    var sel = state.selection;
    var $start = dir > 0 ? sel.$to : sel.$from,
      mustMove = sel.empty;
    if (sel instanceof TextSelection) {
      if (!view.endOfTextblock(dirStr) || $start.depth == 0) {
        return false;
      }
      mustMove = false;
      $start = state.doc.resolve(dir > 0 ? $start.after() : $start.before());
    }
    var $found = GapCursor.findFrom($start, dir, mustMove);
    if (!$found) {
      return false;
    }
    if (dispatch) {
      dispatch(state.tr.setSelection(new GapCursor($found)));
    }
    return true;
  };
}

function handleClick(view, pos, event) {
  if (!view.editable) {
    return false;
  }
  var $pos = view.state.doc.resolve(pos);
  if (!GapCursor.valid($pos)) {
    return false;
  }
  var ref = view.posAtCoords({ left: event.clientX, top: event.clientY });
  var inside = ref.inside;
  if (
    inside > -1 &&
    NodeSelection.isSelectable(view.state.doc.nodeAt(inside))
  ) {
    return false;
  }
  view.dispatch(view.state.tr.setSelection(new GapCursor($pos)));
  return true;
}

function drawGapCursor(state) {
  if (!(state.selection instanceof GapCursor)) {
    return null;
  }
  var node = document.createElement('div');
  node.className = 'ProseMirror-gapcursor';
  return DecorationSet.create(state.doc, [
    Decoration.widget(state.selection.head, node, { key: 'gapcursor' }),
  ]);
}

function crelt() {
  var elt = arguments[0];
  if (typeof elt == 'string') elt = document.createElement(elt);
  var i = 1,
    next = arguments[1];
  if (
    next &&
    typeof next == 'object' &&
    next.nodeType == null &&
    !Array.isArray(next)
  ) {
    for (var name in next)
      if (Object.prototype.hasOwnProperty.call(next, name)) {
        var value = next[name];
        if (typeof value == 'string') elt.setAttribute(name, value);
        else if (value != null) elt[name] = value;
      }
    i++;
  }
  for (; i < arguments.length; i++) add(elt, arguments[i]);
  return elt;
}

function add(elt, child) {
  if (typeof child == 'string') {
    elt.appendChild(document.createTextNode(child));
  } else if (child == null);
  else if (child.nodeType != null) {
    elt.appendChild(child);
  } else if (Array.isArray(child)) {
    for (var i = 0; i < child.length; i++) add(elt, child[i]);
  } else {
    throw new RangeError('Unsupported child node: ' + child);
  }
}

var SVG = 'http://www.w3.org/2000/svg';
var XLINK = 'http://www.w3.org/1999/xlink';

var prefix$1 = 'ProseMirror-icon';

function hashPath(path) {
  var hash = 0;
  for (var i = 0; i < path.length; i++) {
    hash = ((hash << 5) - hash + path.charCodeAt(i)) | 0;
  }
  return hash;
}

function getIcon(icon) {
  var node = document.createElement('div');
  node.className = prefix$1;
  if (icon.path) {
    var name = 'pm-icon-' + hashPath(icon.path).toString(16);
    if (!document.getElementById(name)) {
      buildSVG(name, icon);
    }
    var svg = node.appendChild(document.createElementNS(SVG, 'svg'));
    svg.style.width = icon.width / icon.height + 'em';
    var use = svg.appendChild(document.createElementNS(SVG, 'use'));
    use.setAttributeNS(
      XLINK,
      'href',
      /([^#]*)/.exec(document.location)[1] + '#' + name,
    );
  } else if (icon.dom) {
    node.appendChild(icon.dom.cloneNode(true));
  } else {
    node.appendChild(document.createElement('span')).textContent =
      icon.text || '';
    if (icon.css) {
      node.firstChild.style.cssText = icon.css;
    }
  }
  return node;
}

function buildSVG(name, data) {
  var collection = document.getElementById(prefix$1 + '-collection');
  if (!collection) {
    collection = document.createElementNS(SVG, 'svg');
    collection.id = prefix$1 + '-collection';
    collection.style.display = 'none';
    document.body.insertBefore(collection, document.body.firstChild);
  }
  var sym = document.createElementNS(SVG, 'symbol');
  sym.id = name;
  sym.setAttribute('viewBox', '0 0 ' + data.width + ' ' + data.height);
  var path = sym.appendChild(document.createElementNS(SVG, 'path'));
  path.setAttribute('d', data.path);
  collection.appendChild(sym);
}

var prefix$1$1 = 'ProseMirror-menu';

// ::- An icon or label that, when clicked, executes a command.
var MenuItem = function MenuItem(spec) {
  // :: MenuItemSpec
  // The spec used to create the menu item.
  this.spec = spec;
};

// :: (EditorView) → {dom: dom.Node, update: (EditorState) → bool}
// Renders the icon according to its [display
// spec](#menu.MenuItemSpec.display), and adds an event handler which
// executes the command when the representation is clicked.
MenuItem.prototype.render = function render(view) {
  var spec = this.spec;
  var dom = spec.render
    ? spec.render(view)
    : spec.icon
    ? getIcon(spec.icon)
    : spec.label
    ? crelt('div', null, translate(view, spec.label))
    : null;
  if (!dom) {
    throw new RangeError('MenuItem without icon or label property');
  }
  if (spec.title) {
    var title =
      typeof spec.title === 'function' ? spec.title(view.state) : spec.title;
    dom.setAttribute('title', translate(view, title));
  }
  if (spec.class) {
    dom.classList.add(spec.class);
  }
  if (spec.css) {
    dom.style.cssText += spec.css;
  }

  dom.addEventListener('mousedown', function (e) {
    e.preventDefault();
    if (!dom.classList.contains(prefix$1$1 + '-disabled')) {
      spec.run(view.state, view.dispatch, view, e);
    }
  });

  function update(state) {
    if (spec.select) {
      var selected = spec.select(state);
      dom.style.display = selected ? '' : 'none';
      if (!selected) {
        return false;
      }
    }
    var enabled = true;
    if (spec.enable) {
      enabled = spec.enable(state) || false;
      setClass(dom, prefix$1$1 + '-disabled', !enabled);
    }
    if (spec.active) {
      var active = (enabled && spec.active(state)) || false;
      setClass(dom, prefix$1$1 + '-active', active);
    }
    return true;
  }

  return { dom: dom, update: update };
};

function translate(view, text) {
  return view._props.translate ? view._props.translate(text) : text;
}

// MenuItemSpec:: interface
// The configuration object passed to the `MenuItem` constructor.
//
//   run:: (EditorState, (Transaction), EditorView, dom.Event)
//   The function to execute when the menu item is activated.
//
//   select:: ?(EditorState) → bool
//   Optional function that is used to determine whether the item is
//   appropriate at the moment. Deselected items will be hidden.
//
//   enable:: ?(EditorState) → bool
//   Function that is used to determine if the item is enabled. If
//   given and returning false, the item will be given a disabled
//   styling.
//
//   active:: ?(EditorState) → bool
//   A predicate function to determine whether the item is 'active' (for
//   example, the item for toggling the strong mark might be active then
//   the cursor is in strong text).
//
//   render:: ?(EditorView) → dom.Node
//   A function that renders the item. You must provide either this,
//   [`icon`](#menu.MenuItemSpec.icon), or [`label`](#MenuItemSpec.label).
//
//   icon:: ?Object
//   Describes an icon to show for this item. The object may specify
//   an SVG icon, in which case its `path` property should be an [SVG
//   path
//   spec](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d),
//   and `width` and `height` should provide the viewbox in which that
//   path exists. Alternatively, it may have a `text` property
//   specifying a string of text that makes up the icon, with an
//   optional `css` property giving additional CSS styling for the
//   text. _Or_ it may contain `dom` property containing a DOM node.
//
//   label:: ?string
//   Makes the item show up as a text label. Mostly useful for items
//   wrapped in a [drop-down](#menu.Dropdown) or similar menu. The object
//   should have a `label` property providing the text to display.
//
//   title:: ?union<string, (EditorState) → string>
//   Defines DOM title (mouseover) text for the item.
//
//   class:: ?string
//   Optionally adds a CSS class to the item's DOM representation.
//
//   css:: ?string
//   Optionally adds a string of inline CSS to the item's DOM
//   representation.

var lastMenuEvent = { time: 0, node: null };
function markMenuEvent(e) {
  lastMenuEvent.time = Date.now();
  lastMenuEvent.node = e.target;
}
function isMenuEvent(wrapper) {
  return (
    Date.now() - 100 < lastMenuEvent.time &&
    lastMenuEvent.node &&
    wrapper.contains(lastMenuEvent.node)
  );
}

// ::- A drop-down menu, displayed as a label with a downwards-pointing
// triangle to the right of it.
var Dropdown = function Dropdown(content, options) {
  this.options = options || {};
  this.content = Array.isArray(content) ? content : [content];
};

// :: (EditorView) → {dom: dom.Node, update: (EditorState)}
// Render the dropdown menu and sub-items.
Dropdown.prototype.render = function render(view) {
  var this$1 = this;

  var content = renderDropdownItems(this.content, view);

  var label = crelt(
    'div',
    {
      class: prefix$1$1 + '-dropdown ' + (this.options.class || ''),
      style: this.options.css,
    },
    translate(view, this.options.label),
  );
  if (this.options.title) {
    label.setAttribute('title', translate(view, this.options.title));
  }
  var wrap = crelt('div', { class: prefix$1$1 + '-dropdown-wrap' }, label);
  var open = null,
    listeningOnClose = null;
  var close = function () {
    if (open && open.close()) {
      open = null;
      window.removeEventListener('mousedown', listeningOnClose);
    }
  };
  label.addEventListener('mousedown', function (e) {
    e.preventDefault();
    markMenuEvent(e);
    if (open) {
      close();
    } else {
      open = this$1.expand(wrap, content.dom);
      window.addEventListener(
        'mousedown',
        (listeningOnClose = function () {
          if (!isMenuEvent(wrap)) {
            close();
          }
        }),
      );
    }
  });

  function update(state) {
    var inner = content.update(state);
    wrap.style.display = inner ? '' : 'none';
    return inner;
  }

  return { dom: wrap, update: update };
};

Dropdown.prototype.expand = function expand(dom, items) {
  var menuDOM = crelt(
    'div',
    { class: prefix$1$1 + '-dropdown-menu ' + (this.options.class || '') },
    items,
  );

  var done = false;
  function close() {
    if (done) {
      return;
    }
    done = true;
    dom.removeChild(menuDOM);
    return true;
  }
  dom.appendChild(menuDOM);
  return { close: close, node: menuDOM };
};

function renderDropdownItems(items, view) {
  var rendered = [],
    updates = [];
  for (var i = 0; i < items.length; i++) {
    var ref = items[i].render(view);
    var dom = ref.dom;
    var update = ref.update;
    rendered.push(crelt('div', { class: prefix$1$1 + '-dropdown-item' }, dom));
    updates.push(update);
  }
  return { dom: rendered, update: combineUpdates(updates, rendered) };
}

function combineUpdates(updates, nodes) {
  return function (state) {
    var something = false;
    for (var i = 0; i < updates.length; i++) {
      var up = updates[i](state);
      nodes[i].style.display = up ? '' : 'none';
      if (up) {
        something = true;
      }
    }
    return something;
  };
}

// ::- Represents a submenu wrapping a group of elements that start
// hidden and expand to the right when hovered over or tapped.
var DropdownSubmenu = function DropdownSubmenu(content, options) {
  this.options = options || {};
  this.content = Array.isArray(content) ? content : [content];
};

// :: (EditorView) → {dom: dom.Node, update: (EditorState) → bool}
// Renders the submenu.
DropdownSubmenu.prototype.render = function render(view) {
  var items = renderDropdownItems(this.content, view);

  var label = crelt(
    'div',
    { class: prefix$1$1 + '-submenu-label' },
    translate(view, this.options.label),
  );
  var wrap = crelt(
    'div',
    { class: prefix$1$1 + '-submenu-wrap' },
    label,
    crelt('div', { class: prefix$1$1 + '-submenu' }, items.dom),
  );
  var listeningOnClose = null;
  label.addEventListener('mousedown', function (e) {
    e.preventDefault();
    markMenuEvent(e);
    setClass(wrap, prefix$1$1 + '-submenu-wrap-active');
    if (!listeningOnClose) {
      window.addEventListener(
        'mousedown',
        (listeningOnClose = function () {
          if (!isMenuEvent(wrap)) {
            wrap.classList.remove(prefix$1$1 + '-submenu-wrap-active');
            window.removeEventListener('mousedown', listeningOnClose);
            listeningOnClose = null;
          }
        }),
      );
    }
  });

  function update(state) {
    var inner = items.update(state);
    wrap.style.display = inner ? '' : 'none';
    return inner;
  }
  return { dom: wrap, update: update };
};

// :: (EditorView, [union<MenuElement, [MenuElement]>]) → {dom: ?dom.DocumentFragment, update: (EditorState) → bool}
// Render the given, possibly nested, array of menu elements into a
// document fragment, placing separators between them (and ensuring no
// superfluous separators appear when some of the groups turn out to
// be empty).
function renderGrouped(view, content) {
  var result = document.createDocumentFragment();
  var updates = [],
    separators = [];
  for (var i = 0; i < content.length; i++) {
    var items = content[i],
      localUpdates = [],
      localNodes = [];
    for (var j = 0; j < items.length; j++) {
      var ref = items[j].render(view);
      var dom = ref.dom;
      var update$1 = ref.update;
      var span = crelt('span', { class: prefix$1$1 + 'item' }, dom);
      result.appendChild(span);
      localNodes.push(span);
      localUpdates.push(update$1);
    }
    if (localUpdates.length) {
      updates.push(combineUpdates(localUpdates, localNodes));
      if (i < content.length - 1) {
        separators.push(result.appendChild(separator()));
      }
    }
  }

  function update(state) {
    var something = false,
      needSep = false;
    for (var i = 0; i < updates.length; i++) {
      var hasContent = updates[i](state);
      if (i) {
        separators[i - 1].style.display = needSep && hasContent ? '' : 'none';
      }
      needSep = hasContent;
      if (hasContent) {
        something = true;
      }
    }
    return something;
  }
  return { dom: result, update: update };
}

function separator() {
  return crelt('span', { class: prefix$1$1 + 'separator' });
}

// :: Object
// A set of basic editor-related icons. Contains the properties
// `join`, `lift`, `selectParentNode`, `undo`, `redo`, `strong`, `em`,
// `code`, `link`, `bulletList`, `orderedList`, and `blockquote`, each
// holding an object that can be used as the `icon` option to
// `MenuItem`.
var icons = {
  join: {
    width: 800,
    height: 900,
    path:
      'M0 75h800v125h-800z M0 825h800v-125h-800z M250 400h100v-100h100v100h100v100h-100v100h-100v-100h-100z',
  },
  lift: {
    width: 1024,
    height: 1024,
    path:
      'M219 310v329q0 7-5 12t-12 5q-8 0-13-5l-164-164q-5-5-5-13t5-13l164-164q5-5 13-5 7 0 12 5t5 12zM1024 749v109q0 7-5 12t-12 5h-987q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h987q7 0 12 5t5 12zM1024 530v109q0 7-5 12t-12 5h-621q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h621q7 0 12 5t5 12zM1024 310v109q0 7-5 12t-12 5h-621q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h621q7 0 12 5t5 12zM1024 91v109q0 7-5 12t-12 5h-987q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h987q7 0 12 5t5 12z',
  },
  selectParentNode: { text: '\u2b1a', css: 'font-weight: bold' },
  undo: {
    width: 1024,
    height: 1024,
    path:
      'M761 1024c113-206 132-520-313-509v253l-384-384 384-384v248c534-13 594 472 313 775z',
  },
  redo: {
    width: 1024,
    height: 1024,
    path:
      'M576 248v-248l384 384-384 384v-253c-446-10-427 303-313 509-280-303-221-789 313-775z',
  },
  strong: {
    width: 805,
    height: 1024,
    path:
      'M317 869q42 18 80 18 214 0 214-191 0-65-23-102-15-25-35-42t-38-26-46-14-48-6-54-1q-41 0-57 5 0 30-0 90t-0 90q0 4-0 38t-0 55 2 47 6 38zM309 442q24 4 62 4 46 0 81-7t62-25 42-51 14-81q0-40-16-70t-45-46-61-24-70-8q-28 0-74 7 0 28 2 86t2 86q0 15-0 45t-0 45q0 26 0 39zM0 950l1-53q8-2 48-9t60-15q4-6 7-15t4-19 3-18 1-21 0-19v-37q0-561-12-585-2-4-12-8t-25-6-28-4-27-2-17-1l-2-47q56-1 194-6t213-5q13 0 39 0t38 0q40 0 78 7t73 24 61 40 42 59 16 78q0 29-9 54t-22 41-36 32-41 25-48 22q88 20 146 76t58 141q0 57-20 102t-53 74-78 48-93 27-100 8q-25 0-75-1t-75-1q-60 0-175 6t-132 6z',
  },
  em: {
    width: 585,
    height: 1024,
    path:
      'M0 949l9-48q3-1 46-12t63-21q16-20 23-57 0-4 35-165t65-310 29-169v-14q-13-7-31-10t-39-4-33-3l10-58q18 1 68 3t85 4 68 1q27 0 56-1t69-4 56-3q-2 22-10 50-17 5-58 16t-62 19q-4 10-8 24t-5 22-4 26-3 24q-15 84-50 239t-44 203q-1 5-7 33t-11 51-9 47-3 32l0 10q9 2 105 17-1 25-9 56-6 0-18 0t-18 0q-16 0-49-5t-49-5q-78-1-117-1-29 0-81 5t-69 6z',
  },
  code: {
    width: 896,
    height: 1024,
    path:
      'M608 192l-96 96 224 224-224 224 96 96 288-320-288-320zM288 192l-288 320 288 320 96-96-224-224 224-224-96-96z',
  },
  link: {
    width: 951,
    height: 1024,
    path:
      'M832 694q0-22-16-38l-118-118q-16-16-38-16-24 0-41 18 1 1 10 10t12 12 8 10 7 14 2 15q0 22-16 38t-38 16q-8 0-15-2t-14-7-10-8-12-12-10-10q-18 17-18 41 0 22 16 38l117 118q15 15 38 15 22 0 38-14l84-83q16-16 16-38zM430 292q0-22-16-38l-117-118q-16-16-38-16-22 0-38 15l-84 83q-16 16-16 38 0 22 16 38l118 118q15 15 38 15 24 0 41-17-1-1-10-10t-12-12-8-10-7-14-2-15q0-22 16-38t38-16q8 0 15 2t14 7 10 8 12 12 10 10q18-17 18-41zM941 694q0 68-48 116l-84 83q-47 47-116 47-69 0-116-48l-117-118q-47-47-47-116 0-70 50-119l-50-50q-49 50-118 50-68 0-116-48l-118-118q-48-48-48-116t48-116l84-83q47-47 116-47 69 0 116 48l117 118q47 47 47 116 0 70-50 119l50 50q49-50 118-50 68 0 116 48l118 118q48 48 48 116z',
  },
  bulletList: {
    width: 768,
    height: 896,
    path:
      'M0 512h128v-128h-128v128zM0 256h128v-128h-128v128zM0 768h128v-128h-128v128zM256 512h512v-128h-512v128zM256 256h512v-128h-512v128zM256 768h512v-128h-512v128z',
  },
  orderedList: {
    width: 768,
    height: 896,
    path:
      'M320 512h448v-128h-448v128zM320 768h448v-128h-448v128zM320 128v128h448v-128h-448zM79 384h78v-256h-36l-85 23v50l43-2v185zM189 590c0-36-12-78-96-78-33 0-64 6-83 16l1 66c21-10 42-15 67-15s32 11 32 28c0 26-30 58-110 112v50h192v-67l-91 2c49-30 87-66 87-113l1-1z',
  },
  blockquote: {
    width: 640,
    height: 896,
    path:
      'M0 448v256h256v-256h-128c0 0 0-128 128-128v-128c0 0-256 0-256 256zM640 320v-128c0 0-256 0-256 256v256h256v-256h-128c0 0 0-128 128-128z',
  },
};

// :: MenuItem
// Menu item for the `joinUp` command.
var joinUpItem = new MenuItem({
  title: 'Join with above block',
  run: joinUp,
  select: function (state) {
    return joinUp(state);
  },
  icon: icons.join,
});

// :: MenuItem
// Menu item for the `lift` command.
var liftItem = new MenuItem({
  title: 'Lift out of enclosing block',
  run: lift,
  select: function (state) {
    return lift(state);
  },
  icon: icons.lift,
});

// :: MenuItem
// Menu item for the `selectParentNode` command.
var selectParentNodeItem = new MenuItem({
  title: 'Select parent node',
  run: selectParentNode,
  select: function (state) {
    return selectParentNode(state);
  },
  icon: icons.selectParentNode,
});

// :: MenuItem
// Menu item for the `undo` command.
var undoItem = new MenuItem({
  title: 'Undo last change',
  run: undo,
  enable: function (state) {
    return undo(state);
  },
  icon: icons.undo,
});

// :: MenuItem
// Menu item for the `redo` command.
var redoItem = new MenuItem({
  title: 'Redo last undone change',
  run: redo,
  enable: function (state) {
    return redo(state);
  },
  icon: icons.redo,
});

// :: (NodeType, Object) → MenuItem
// Build a menu item for wrapping the selection in a given node type.
// Adds `run` and `select` properties to the ones present in
// `options`. `options.attrs` may be an object or a function.
function wrapItem(nodeType, options) {
  var passedOptions = {
    run: function run(state, dispatch) {
      // FIXME if (options.attrs instanceof Function) options.attrs(state, attrs => wrapIn(nodeType, attrs)(state))
      return wrapIn(nodeType, options.attrs)(state, dispatch);
    },
    select: function select(state) {
      return wrapIn(
        nodeType,
        options.attrs instanceof Function ? null : options.attrs,
      )(state);
    },
  };
  for (var prop in options) {
    passedOptions[prop] = options[prop];
  }
  return new MenuItem(passedOptions);
}

// :: (NodeType, Object) → MenuItem
// Build a menu item for changing the type of the textblock around the
// selection to the given type. Provides `run`, `active`, and `select`
// properties. Others must be given in `options`. `options.attrs` may
// be an object to provide the attributes for the textblock node.
function blockTypeItem(nodeType, options) {
  var command = setBlockType(nodeType, options.attrs);
  var passedOptions = {
    run: command,
    enable: function enable(state) {
      return command(state);
    },
    active: function active(state) {
      var ref = state.selection;
      var $from = ref.$from;
      var to = ref.to;
      var node = ref.node;
      if (node) {
        return node.hasMarkup(nodeType, options.attrs);
      }
      return (
        to <= $from.end() && $from.parent.hasMarkup(nodeType, options.attrs)
      );
    },
  };
  for (var prop in options) {
    passedOptions[prop] = options[prop];
  }
  return new MenuItem(passedOptions);
}

// Work around classList.toggle being broken in IE11
function setClass(dom, cls, on) {
  if (on) {
    dom.classList.add(cls);
  } else {
    dom.classList.remove(cls);
  }
}

var prefix$2 = 'ProseMirror-menubar';

function isIOS() {
  if (typeof navigator == 'undefined') {
    return false;
  }
  var agent = navigator.userAgent;
  return (
    !/Edge\/\d/.test(agent) &&
    /AppleWebKit/.test(agent) &&
    /Mobile\/\w+/.test(agent)
  );
}

// :: (Object) → Plugin
// A plugin that will place a menu bar above the editor. Note that
// this involves wrapping the editor in an additional `<div>`.
//
//   options::-
//   Supports the following options:
//
//     content:: [[MenuElement]]
//     Provides the content of the menu, as a nested array to be
//     passed to `renderGrouped`.
//
//     floating:: ?bool
//     Determines whether the menu floats, i.e. whether it sticks to
//     the top of the viewport when the editor is partially scrolled
//     out of view.
function menuBar(options) {
  return new Plugin({
    view: function view(editorView) {
      return new MenuBarView(editorView, options);
    },
  });
}

var MenuBarView = function MenuBarView(editorView, options) {
  var this$1 = this;

  this.editorView = editorView;
  this.options = options;

  this.wrapper = crelt('div', { class: prefix$2 + '-wrapper' });
  this.menu = this.wrapper.appendChild(crelt('div', { class: prefix$2 }));
  this.menu.className = prefix$2;
  this.spacer = null;

  editorView.dom.parentNode.replaceChild(this.wrapper, editorView.dom);
  this.wrapper.appendChild(editorView.dom);

  this.maxHeight = 0;
  this.widthForMaxHeight = 0;
  this.floating = false;

  var ref = renderGrouped(this.editorView, this.options.content);
  var dom = ref.dom;
  var update = ref.update;
  this.contentUpdate = update;
  this.menu.appendChild(dom);
  this.update();

  if (options.floating && !isIOS()) {
    this.updateFloat();
    var potentialScrollers = getAllWrapping(this.wrapper);
    this.scrollFunc = function (e) {
      var root = this$1.editorView.root;
      if (!(root.body || root).contains(this$1.wrapper)) {
        potentialScrollers.forEach(function (el) {
          return el.removeEventListener('scroll', this$1.scrollFunc);
        });
      } else {
        this$1.updateFloat(e.target.getBoundingClientRect && e.target);
      }
    };
    potentialScrollers.forEach(function (el) {
      return el.addEventListener('scroll', this$1.scrollFunc);
    });
  }
};

MenuBarView.prototype.update = function update() {
  this.contentUpdate(this.editorView.state);

  if (this.floating) {
    this.updateScrollCursor();
  } else {
    if (this.menu.offsetWidth != this.widthForMaxHeight) {
      this.widthForMaxHeight = this.menu.offsetWidth;
      this.maxHeight = 0;
    }
    if (this.menu.offsetHeight > this.maxHeight) {
      this.maxHeight = this.menu.offsetHeight;
      this.menu.style.minHeight = this.maxHeight + 'px';
    }
  }
};

MenuBarView.prototype.updateScrollCursor = function updateScrollCursor() {
  var selection = this.editorView.root.getSelection();
  if (!selection.focusNode) {
    return;
  }
  var rects = selection.getRangeAt(0).getClientRects();
  var selRect = rects[selectionIsInverted(selection) ? 0 : rects.length - 1];
  if (!selRect) {
    return;
  }
  var menuRect = this.menu.getBoundingClientRect();
  if (selRect.top < menuRect.bottom && selRect.bottom > menuRect.top) {
    var scrollable = findWrappingScrollable(this.wrapper);
    if (scrollable) {
      scrollable.scrollTop -= menuRect.bottom - selRect.top;
    }
  }
};

MenuBarView.prototype.updateFloat = function updateFloat(scrollAncestor) {
  var parent = this.wrapper,
    editorRect = parent.getBoundingClientRect(),
    top = scrollAncestor
      ? Math.max(0, scrollAncestor.getBoundingClientRect().top)
      : 0;

  if (this.floating) {
    if (
      editorRect.top >= top ||
      editorRect.bottom < this.menu.offsetHeight + 10
    ) {
      this.floating = false;
      this.menu.style.position = this.menu.style.left = this.menu.style.top = this.menu.style.width =
        '';
      this.menu.style.display = '';
      this.spacer.parentNode.removeChild(this.spacer);
      this.spacer = null;
    } else {
      var border = (parent.offsetWidth - parent.clientWidth) / 2;
      this.menu.style.left = editorRect.left + border + 'px';
      this.menu.style.display =
        editorRect.top > window.innerHeight ? 'none' : '';
      if (scrollAncestor) {
        this.menu.style.top = top + 'px';
      }
    }
  } else {
    if (
      editorRect.top < top &&
      editorRect.bottom >= this.menu.offsetHeight + 10
    ) {
      this.floating = true;
      var menuRect = this.menu.getBoundingClientRect();
      this.menu.style.left = menuRect.left + 'px';
      this.menu.style.width = menuRect.width + 'px';
      if (scrollAncestor) {
        this.menu.style.top = top + 'px';
      }
      this.menu.style.position = 'fixed';
      this.spacer = crelt('div', {
        class: prefix$2 + '-spacer',
        style: 'height: ' + menuRect.height + 'px',
      });
      parent.insertBefore(this.spacer, this.menu);
    }
  }
};

MenuBarView.prototype.destroy = function destroy() {
  if (this.wrapper.parentNode) {
    this.wrapper.parentNode.replaceChild(this.editorView.dom, this.wrapper);
  }
};

// Not precise, but close enough
function selectionIsInverted(selection) {
  if (selection.anchorNode == selection.focusNode) {
    return selection.anchorOffset > selection.focusOffset;
  }
  return (
    selection.anchorNode.compareDocumentPosition(selection.focusNode) ==
    Node.DOCUMENT_POSITION_FOLLOWING
  );
}

function findWrappingScrollable(node) {
  for (var cur = node.parentNode; cur; cur = cur.parentNode) {
    if (cur.scrollHeight > cur.clientHeight) {
      return cur;
    }
  }
}

function getAllWrapping(node) {
  var res = [window];
  for (var cur = node.parentNode; cur; cur = cur.parentNode) {
    res.push(cur);
  }
  return res;
}

// ::- Input rules are regular expressions describing a piece of text
// that, when typed, causes something to happen. This might be
// changing two dashes into an emdash, wrapping a paragraph starting
// with `"> "` into a blockquote, or something entirely different.
var InputRule = function InputRule(match, handler) {
  this.match = match;
  this.handler = typeof handler == 'string' ? stringHandler(handler) : handler;
};

function stringHandler(string) {
  return function (state, match, start, end) {
    var insert = string;
    if (match[1]) {
      var offset = match[0].lastIndexOf(match[1]);
      insert += match[0].slice(offset + match[1].length);
      start += offset;
      var cutOff = start - end;
      if (cutOff > 0) {
        insert = match[0].slice(offset - cutOff, offset) + insert;
        start = end;
      }
    }
    return state.tr.insertText(insert, start, end);
  };
}

var MAX_MATCH = 500;

// :: (config: {rules: [InputRule]}) → Plugin
// Create an input rules plugin. When enabled, it will cause text
// input that matches any of the given rules to trigger the rule's
// action.
function inputRules(ref) {
  var rules = ref.rules;

  var plugin = new Plugin({
    state: {
      init: function init() {
        return null;
      },
      apply: function apply(tr, prev) {
        var stored = tr.getMeta(this);
        if (stored) {
          return stored;
        }
        return tr.selectionSet || tr.docChanged ? null : prev;
      },
    },

    props: {
      handleTextInput: function handleTextInput(view, from, to, text) {
        return run(view, from, to, text, rules, plugin);
      },
      handleDOMEvents: {
        compositionend: function (view) {
          setTimeout(function () {
            var ref = view.state.selection;
            var $cursor = ref.$cursor;
            if ($cursor) {
              run(view, $cursor.pos, $cursor.pos, '', rules, plugin);
            }
          });
        },
      },
    },

    isInputRules: true,
  });
  return plugin;
}

function run(view, from, to, text, rules, plugin) {
  if (view.composing) {
    return false;
  }
  var state = view.state,
    $from = state.doc.resolve(from);
  if ($from.parent.type.spec.code) {
    return false;
  }
  var textBefore =
    $from.parent.textBetween(
      Math.max(0, $from.parentOffset - MAX_MATCH),
      $from.parentOffset,
      null,
      '\ufffc',
    ) + text;
  for (var i = 0; i < rules.length; i++) {
    var match = rules[i].match.exec(textBefore);
    var tr =
      match &&
      rules[i].handler(
        state,
        match,
        from - (match[0].length - text.length),
        to,
      );
    if (!tr) {
      continue;
    }
    view.dispatch(
      tr.setMeta(plugin, { transform: tr, from: from, to: to, text: text }),
    );
    return true;
  }
  return false;
}

// :: (EditorState, ?(Transaction)) → bool
// This is a command that will undo an input rule, if applying such a
// rule was the last thing that the user did.
function undoInputRule(state, dispatch) {
  var plugins = state.plugins;
  for (var i = 0; i < plugins.length; i++) {
    var plugin = plugins[i],
      undoable = void 0;
    if (plugin.spec.isInputRules && (undoable = plugin.getState(state))) {
      if (dispatch) {
        var tr = state.tr,
          toUndo = undoable.transform;
        for (var j = toUndo.steps.length - 1; j >= 0; j--) {
          tr.step(toUndo.steps[j].invert(toUndo.docs[j]));
        }
        if (undoable.text) {
          var marks = tr.doc.resolve(undoable.from).marks();
          tr.replaceWith(
            undoable.from,
            undoable.to,
            state.schema.text(undoable.text, marks),
          );
        } else {
          tr.delete(undoable.from, undoable.to);
        }
        dispatch(tr);
      }
      return true;
    }
  }
  return false;
}

// :: InputRule Converts double dashes to an emdash.
var emDash = new InputRule(/--$/, '—');
// :: InputRule Converts three dots to an ellipsis character.
var ellipsis = new InputRule(/\.\.\.$/, '…');
// :: InputRule “Smart” opening double quotes.
var openDoubleQuote = new InputRule(
  /(?:^|[\s\{\[\(\<'"\u2018\u201C])(")$/,
  '“',
);
// :: InputRule “Smart” closing double quotes.
var closeDoubleQuote = new InputRule(/"$/, '”');
// :: InputRule “Smart” opening single quotes.
var openSingleQuote = new InputRule(
  /(?:^|[\s\{\[\(\<'"\u2018\u201C])(')$/,
  '‘',
);
// :: InputRule “Smart” closing single quotes.
var closeSingleQuote = new InputRule(/'$/, '’');

// :: [InputRule] Smart-quote related input rules.
var smartQuotes = [
  openDoubleQuote,
  closeDoubleQuote,
  openSingleQuote,
  closeSingleQuote,
];

// :: (RegExp, NodeType, ?union<Object, ([string]) → ?Object>, ?([string], Node) → bool) → InputRule
// Build an input rule for automatically wrapping a textblock when a
// given string is typed. The `regexp` argument is
// directly passed through to the `InputRule` constructor. You'll
// probably want the regexp to start with `^`, so that the pattern can
// only occur at the start of a textblock.
//
// `nodeType` is the type of node to wrap in. If it needs attributes,
// you can either pass them directly, or pass a function that will
// compute them from the regular expression match.
//
// By default, if there's a node with the same type above the newly
// wrapped node, the rule will try to [join](#transform.Transform.join) those
// two nodes. You can pass a join predicate, which takes a regular
// expression match and the node before the wrapped node, and can
// return a boolean to indicate whether a join should happen.
function wrappingInputRule(regexp, nodeType, getAttrs, joinPredicate) {
  return new InputRule(regexp, function (state, match, start, end) {
    var attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
    var tr = state.tr.delete(start, end);
    var $start = tr.doc.resolve(start),
      range = $start.blockRange(),
      wrapping = range && findWrapping(range, nodeType, attrs);
    if (!wrapping) {
      return null;
    }
    tr.wrap(range, wrapping);
    var before = tr.doc.resolve(start - 1).nodeBefore;
    if (
      before &&
      before.type == nodeType &&
      canJoin(tr.doc, start - 1) &&
      (!joinPredicate || joinPredicate(match, before))
    ) {
      tr.join(start - 1);
    }
    return tr;
  });
}

// :: (RegExp, NodeType, ?union<Object, ([string]) → ?Object>) → InputRule
// Build an input rule that changes the type of a textblock when the
// matched text is typed into it. You'll usually want to start your
// regexp with `^` to that it is only matched at the start of a
// textblock. The optional `getAttrs` parameter can be used to compute
// the new node's attributes, and works the same as in the
// `wrappingInputRule` function.
function textblockTypeInputRule(regexp, nodeType, getAttrs) {
  return new InputRule(regexp, function (state, match, start, end) {
    var $start = state.doc.resolve(start);
    var attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
    if (
      !$start
        .node(-1)
        .canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType)
    ) {
      return null;
    }
    return state.tr
      .delete(start, end)
      .setBlockType(start, start, nodeType, attrs);
  });
}

var prefix = 'ProseMirror-prompt';

function openPrompt(options) {
  var wrapper = document.body.appendChild(document.createElement('div'));
  wrapper.className = prefix;

  var mouseOutside = function (e) {
    if (!wrapper.contains(e.target)) {
      close();
    }
  };
  setTimeout(function () {
    return window.addEventListener('mousedown', mouseOutside);
  }, 50);
  var close = function () {
    window.removeEventListener('mousedown', mouseOutside);
    if (wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  };

  var domFields = [];
  for (var name in options.fields) {
    domFields.push(options.fields[name].render());
  }

  var submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = prefix + '-submit';
  submitButton.textContent = 'OK';
  var cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = prefix + '-cancel';
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', close);

  var form = wrapper.appendChild(document.createElement('form'));
  if (options.title) {
    form.appendChild(document.createElement('h5')).textContent = options.title;
  }
  domFields.forEach(function (field) {
    form.appendChild(document.createElement('div')).appendChild(field);
  });
  var buttons = form.appendChild(document.createElement('div'));
  buttons.className = prefix + '-buttons';
  buttons.appendChild(submitButton);
  buttons.appendChild(document.createTextNode(' '));
  buttons.appendChild(cancelButton);

  var box = wrapper.getBoundingClientRect();
  wrapper.style.top = (window.innerHeight - box.height) / 2 + 'px';
  wrapper.style.left = (window.innerWidth - box.width) / 2 + 'px';

  var submit = function () {
    var params = getValues(options.fields, domFields);
    if (params) {
      close();
      options.callback(params);
    }
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    submit();
  });

  form.addEventListener('keydown', function (e) {
    if (e.keyCode == 27) {
      e.preventDefault();
      close();
    } else if (e.keyCode == 13 && !(e.ctrlKey || e.metaKey || e.shiftKey)) {
      e.preventDefault();
      submit();
    } else if (e.keyCode == 9) {
      window.setTimeout(function () {
        if (!wrapper.contains(document.activeElement)) {
          close();
        }
      }, 500);
    }
  });

  var input = form.elements[0];
  if (input) {
    input.focus();
  }
}

function getValues(fields, domFields) {
  var result = Object.create(null),
    i = 0;
  for (var name in fields) {
    var field = fields[name],
      dom = domFields[i++];
    var value = field.read(dom),
      bad = field.validate(value);
    if (bad) {
      reportInvalid(dom, bad);
      return null;
    }
    result[name] = field.clean(value);
  }
  return result;
}

function reportInvalid(dom, message) {
  // FIXME this is awful and needs a lot more work
  var parent = dom.parentNode;
  var msg = parent.appendChild(document.createElement('div'));
  msg.style.left = dom.offsetLeft + dom.offsetWidth + 2 + 'px';
  msg.style.top = dom.offsetTop - 5 + 'px';
  msg.className = 'ProseMirror-invalid';
  msg.textContent = message;
  setTimeout(function () {
    return parent.removeChild(msg);
  }, 1500);
}

// ::- The type of field that `FieldPrompt` expects to be passed to it.
var Field = function Field(options) {
  this.options = options;
};

// render:: (state: EditorState, props: Object) → dom.Node
// Render the field to the DOM. Should be implemented by all subclasses.

// :: (dom.Node) → any
// Read the field's value from its DOM node.
Field.prototype.read = function read(dom) {
  return dom.value;
};

// :: (any) → ?string
// A field-type-specific validation function.
Field.prototype.validateType = function validateType(_value) {};

Field.prototype.validate = function validate(value) {
  if (!value && this.options.required) {
    return 'Required field';
  }
  return (
    this.validateType(value) ||
    (this.options.validate && this.options.validate(value))
  );
};

Field.prototype.clean = function clean(value) {
  return this.options.clean ? this.options.clean(value) : value;
};

// ::- A field class for single-line text fields.
var TextField = /*@__PURE__*/ (function (Field) {
  function TextField() {
    Field.apply(this, arguments);
  }

  if (Field) TextField.__proto__ = Field;
  TextField.prototype = Object.create(Field && Field.prototype);
  TextField.prototype.constructor = TextField;

  TextField.prototype.render = function render() {
    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = this.options.label;
    input.value = this.options.value || '';
    input.autocomplete = 'off';
    return input;
  };

  return TextField;
})(Field);

// Helpers to create specific types of items

function canInsert(state, nodeType) {
  var $from = state.selection.$from;
  for (var d = $from.depth; d >= 0; d--) {
    var index = $from.index(d);
    if ($from.node(d).canReplaceWith(index, index, nodeType)) {
      return true;
    }
  }
  return false;
}

function insertImageItem(nodeType) {
  return new MenuItem({
    title: 'Insert image',
    label: 'Image',
    enable: function enable(state) {
      return canInsert(state, nodeType);
    },
    run: function run(state, _, view) {
      var ref = state.selection;
      var from = ref.from;
      var to = ref.to;
      var attrs = null;
      if (
        state.selection instanceof NodeSelection &&
        state.selection.node.type == nodeType
      ) {
        attrs = state.selection.node.attrs;
      }
      openPrompt({
        title: 'Insert image',
        fields: {
          src: new TextField({
            label: 'Location',
            required: true,
            value: attrs && attrs.src,
          }),
          title: new TextField({ label: 'Title', value: attrs && attrs.title }),
          alt: new TextField({
            label: 'Description',
            value: attrs ? attrs.alt : state.doc.textBetween(from, to, ' '),
          }),
        },
        callback: function callback(attrs) {
          view.dispatch(
            view.state.tr.replaceSelectionWith(nodeType.createAndFill(attrs)),
          );
          view.focus();
        },
      });
    },
  });
}

function cmdItem(cmd, options) {
  var passedOptions = {
    label: options.title,
    run: cmd,
  };
  for (var prop in options) {
    passedOptions[prop] = options[prop];
  }
  if ((!options.enable || options.enable === true) && !options.select) {
    passedOptions[options.enable ? 'enable' : 'select'] = function (state) {
      return cmd(state);
    };
  }

  return new MenuItem(passedOptions);
}

function markActive(state, type) {
  var ref = state.selection;
  var from = ref.from;
  var $from = ref.$from;
  var to = ref.to;
  var empty = ref.empty;
  if (empty) {
    return type.isInSet(state.storedMarks || $from.marks());
  } else {
    return state.doc.rangeHasMark(from, to, type);
  }
}

function markItem(markType, options) {
  var passedOptions = {
    active: function active(state) {
      return markActive(state, markType);
    },
    enable: true,
  };
  for (var prop in options) {
    passedOptions[prop] = options[prop];
  }
  return cmdItem(toggleMark(markType), passedOptions);
}

function linkItem(markType) {
  return new MenuItem({
    title: 'Add or remove link',
    icon: icons.link,
    active: function active(state) {
      return markActive(state, markType);
    },
    enable: function enable(state) {
      return !state.selection.empty;
    },
    run: function run(state, dispatch, view) {
      if (markActive(state, markType)) {
        toggleMark(markType)(state, dispatch);
        return true;
      }
      openPrompt({
        title: 'Create a link',
        fields: {
          href: new TextField({
            label: 'Link target',
            required: true,
          }),
          title: new TextField({ label: 'Title' }),
        },
        callback: function callback(attrs) {
          toggleMark(markType, attrs)(view.state, view.dispatch);
          view.focus();
        },
      });
    },
  });
}

function wrapListItem(nodeType, options) {
  return cmdItem(wrapInList(nodeType, options.attrs), options);
}

// :: (Schema) → Object
// Given a schema, look for default mark and node types in it and
// return an object with relevant menu items relating to those marks:
//
// **`toggleStrong`**`: MenuItem`
//   : A menu item to toggle the [strong mark](#schema-basic.StrongMark).
//
// **`toggleEm`**`: MenuItem`
//   : A menu item to toggle the [emphasis mark](#schema-basic.EmMark).
//
// **`toggleCode`**`: MenuItem`
//   : A menu item to toggle the [code font mark](#schema-basic.CodeMark).
//
// **`toggleLink`**`: MenuItem`
//   : A menu item to toggle the [link mark](#schema-basic.LinkMark).
//
// **`insertImage`**`: MenuItem`
//   : A menu item to insert an [image](#schema-basic.Image).
//
// **`wrapBulletList`**`: MenuItem`
//   : A menu item to wrap the selection in a [bullet list](#schema-list.BulletList).
//
// **`wrapOrderedList`**`: MenuItem`
//   : A menu item to wrap the selection in an [ordered list](#schema-list.OrderedList).
//
// **`wrapBlockQuote`**`: MenuItem`
//   : A menu item to wrap the selection in a [block quote](#schema-basic.BlockQuote).
//
// **`makeParagraph`**`: MenuItem`
//   : A menu item to set the current textblock to be a normal
//     [paragraph](#schema-basic.Paragraph).
//
// **`makeCodeBlock`**`: MenuItem`
//   : A menu item to set the current textblock to be a
//     [code block](#schema-basic.CodeBlock).
//
// **`makeHead[N]`**`: MenuItem`
//   : Where _N_ is 1 to 6. Menu items to set the current textblock to
//     be a [heading](#schema-basic.Heading) of level _N_.
//
// **`insertHorizontalRule`**`: MenuItem`
//   : A menu item to insert a horizontal rule.
//
// The return value also contains some prefabricated menu elements and
// menus, that you can use instead of composing your own menu from
// scratch:
//
// **`insertMenu`**`: Dropdown`
//   : A dropdown containing the `insertImage` and
//     `insertHorizontalRule` items.
//
// **`typeMenu`**`: Dropdown`
//   : A dropdown containing the items for making the current
//     textblock a paragraph, code block, or heading.
//
// **`fullMenu`**`: [[MenuElement]]`
//   : An array of arrays of menu elements for use as the full menu
//     for, for example the [menu bar](https://github.com/prosemirror/prosemirror-menu#user-content-menubar).
function buildMenuItems(schema) {
  var r = {},
    type;
  if ((type = schema.marks.strong)) {
    r.toggleStrong = markItem(type, {
      title: 'Toggle strong style',
      icon: icons.strong,
    });
  }
  if ((type = schema.marks.em)) {
    r.toggleEm = markItem(type, { title: 'Toggle emphasis', icon: icons.em });
  }
  if ((type = schema.marks.code)) {
    r.toggleCode = markItem(type, {
      title: 'Toggle code font',
      icon: icons.code,
    });
  }
  if ((type = schema.marks.link)) {
    r.toggleLink = linkItem(type);
  }

  if ((type = schema.nodes.image)) {
    r.insertImage = insertImageItem(type);
  }
  if ((type = schema.nodes.bullet_list)) {
    r.wrapBulletList = wrapListItem(type, {
      title: 'Wrap in bullet list',
      icon: icons.bulletList,
    });
  }
  if ((type = schema.nodes.ordered_list)) {
    r.wrapOrderedList = wrapListItem(type, {
      title: 'Wrap in ordered list',
      icon: icons.orderedList,
    });
  }
  if ((type = schema.nodes.blockquote)) {
    r.wrapBlockQuote = wrapItem(type, {
      title: 'Wrap in block quote',
      icon: icons.blockquote,
    });
  }
  if ((type = schema.nodes.paragraph)) {
    r.makeParagraph = blockTypeItem(type, {
      title: 'Change to paragraph',
      label: 'Plain',
    });
  }
  if ((type = schema.nodes.code_block)) {
    r.makeCodeBlock = blockTypeItem(type, {
      title: 'Change to code block',
      label: 'Code',
    });
  }
  if ((type = schema.nodes.heading)) {
    for (var i = 1; i <= 10; i++) {
      r['makeHead' + i] = blockTypeItem(type, {
        title: 'Change to heading ' + i,
        label: 'Level ' + i,
        attrs: { level: i },
      });
    }
  }
  if ((type = schema.nodes.horizontal_rule)) {
    var hr = type;
    r.insertHorizontalRule = new MenuItem({
      title: 'Insert horizontal rule',
      label: 'Horizontal rule',
      enable: function enable(state) {
        return canInsert(state, hr);
      },
      run: function run(state, dispatch) {
        dispatch(state.tr.replaceSelectionWith(hr.create()));
      },
    });
  }

  var cut = function (arr) {
    return arr.filter(function (x) {
      return x;
    });
  };
  r.insertMenu = new Dropdown(cut([r.insertImage, r.insertHorizontalRule]), {
    label: 'Insert',
  });
  r.typeMenu = new Dropdown(
    cut([
      r.makeParagraph,
      r.makeCodeBlock,
      r.makeHead1 &&
        new DropdownSubmenu(
          cut([
            r.makeHead1,
            r.makeHead2,
            r.makeHead3,
            r.makeHead4,
            r.makeHead5,
            r.makeHead6,
          ]),
          { label: 'Heading' },
        ),
    ]),
    { label: 'Type...' },
  );

  r.inlineMenu = [
    cut([r.toggleStrong, r.toggleEm, r.toggleCode, r.toggleLink]),
  ];
  r.blockMenu = [
    cut([
      r.wrapBulletList,
      r.wrapOrderedList,
      r.wrapBlockQuote,
      joinUpItem,
      liftItem,
      selectParentNodeItem,
    ]),
  ];
  r.fullMenu = r.inlineMenu.concat(
    [[r.insertMenu, r.typeMenu]],
    [[undoItem, redoItem]],
    r.blockMenu,
  );

  return r;
}

var mac =
  typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false;

// :: (Schema, ?Object) → Object
// Inspect the given schema looking for marks and nodes from the
// basic schema, and if found, add key bindings related to them.
// This will add:
//
// * **Mod-b** for toggling [strong](#schema-basic.StrongMark)
// * **Mod-i** for toggling [emphasis](#schema-basic.EmMark)
// * **Mod-`** for toggling [code font](#schema-basic.CodeMark)
// * **Ctrl-Shift-0** for making the current textblock a paragraph
// * **Ctrl-Shift-1** to **Ctrl-Shift-Digit6** for making the current
//   textblock a heading of the corresponding level
// * **Ctrl-Shift-Backslash** to make the current textblock a code block
// * **Ctrl-Shift-8** to wrap the selection in an ordered list
// * **Ctrl-Shift-9** to wrap the selection in a bullet list
// * **Ctrl->** to wrap the selection in a block quote
// * **Enter** to split a non-empty textblock in a list item while at
//   the same time splitting the list item
// * **Mod-Enter** to insert a hard break
// * **Mod-_** to insert a horizontal rule
// * **Backspace** to undo an input rule
// * **Alt-ArrowUp** to `joinUp`
// * **Alt-ArrowDown** to `joinDown`
// * **Mod-BracketLeft** to `lift`
// * **Escape** to `selectParentNode`
//
// You can suppress or map these bindings by passing a `mapKeys`
// argument, which maps key names (say `"Mod-B"` to either `false`, to
// remove the binding, or a new key name string.
function buildKeymap(schema, mapKeys) {
  var keys = {},
    type;
  function bind(key, cmd) {
    if (mapKeys) {
      var mapped = mapKeys[key];
      if (mapped === false) {
        return;
      }
      if (mapped) {
        key = mapped;
      }
    }
    keys[key] = cmd;
  }

  bind('Mod-z', undo);
  bind('Shift-Mod-z', redo);
  bind('Backspace', undoInputRule);
  if (!mac) {
    bind('Mod-y', redo);
  }

  bind('Alt-ArrowUp', joinUp);
  bind('Alt-ArrowDown', joinDown);
  bind('Mod-BracketLeft', lift);
  bind('Escape', selectParentNode);

  if ((type = schema.marks.strong)) {
    bind('Mod-b', toggleMark(type));
    bind('Mod-B', toggleMark(type));
  }
  if ((type = schema.marks.em)) {
    bind('Mod-i', toggleMark(type));
    bind('Mod-I', toggleMark(type));
  }
  if ((type = schema.marks.code)) {
    bind('Mod-`', toggleMark(type));
  }

  if ((type = schema.nodes.bullet_list)) {
    bind('Shift-Ctrl-8', wrapInList(type));
  }
  if ((type = schema.nodes.ordered_list)) {
    bind('Shift-Ctrl-9', wrapInList(type));
  }
  if ((type = schema.nodes.blockquote)) {
    bind('Ctrl->', wrapIn(type));
  }
  if ((type = schema.nodes.hard_break)) {
    var br = type,
      cmd = chainCommands(exitCode, function (state, dispatch) {
        dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView());
        return true;
      });
    bind('Mod-Enter', cmd);
    bind('Shift-Enter', cmd);
    if (mac) {
      bind('Ctrl-Enter', cmd);
    }
  }
  if ((type = schema.nodes.list_item)) {
    bind('Enter', splitListItem(type));
    bind('Mod-[', liftListItem(type));
    bind('Mod-]', sinkListItem(type));
  }
  if ((type = schema.nodes.paragraph)) {
    bind('Shift-Ctrl-0', setBlockType(type));
  }
  if ((type = schema.nodes.code_block)) {
    bind('Shift-Ctrl-\\', setBlockType(type));
  }
  if ((type = schema.nodes.heading)) {
    for (var i = 1; i <= 6; i++) {
      bind('Shift-Ctrl-' + i, setBlockType(type, { level: i }));
    }
  }
  if ((type = schema.nodes.horizontal_rule)) {
    var hr = type;
    bind('Mod-_', function (state, dispatch) {
      dispatch(state.tr.replaceSelectionWith(hr.create()).scrollIntoView());
      return true;
    });
  }

  return keys;
}

// : (NodeType) → InputRule
// Given a blockquote node type, returns an input rule that turns `"> "`
// at the start of a textblock into a blockquote.
function blockQuoteRule(nodeType) {
  return wrappingInputRule(/^\s*>\s$/, nodeType);
}

// : (NodeType) → InputRule
// Given a list node type, returns an input rule that turns a number
// followed by a dot at the start of a textblock into an ordered list.
function orderedListRule(nodeType) {
  return wrappingInputRule(
    /^(\d+)\.\s$/,
    nodeType,
    function (match) {
      return { order: +match[1] };
    },
    function (match, node) {
      return node.childCount + node.attrs.order == +match[1];
    },
  );
}

// : (NodeType) → InputRule
// Given a list node type, returns an input rule that turns a bullet
// (dash, plush, or asterisk) at the start of a textblock into a
// bullet list.
function bulletListRule(nodeType) {
  return wrappingInputRule(/^\s*([-+*])\s$/, nodeType);
}

// : (NodeType) → InputRule
// Given a code block node type, returns an input rule that turns a
// textblock starting with three backticks into a code block.
function codeBlockRule(nodeType) {
  return textblockTypeInputRule(/^```$/, nodeType);
}

// : (NodeType, number) → InputRule
// Given a node type and a maximum level, creates an input rule that
// turns up to that number of `#` characters followed by a space at
// the start of a textblock into a heading whose level corresponds to
// the number of `#` signs.
function headingRule(nodeType, maxLevel) {
  return textblockTypeInputRule(
    new RegExp('^(#{1,' + maxLevel + '})\\s$'),
    nodeType,
    function (match) {
      return { level: match[1].length };
    },
  );
}

// : (Schema) → Plugin
// A set of input rules for creating the basic block quotes, lists,
// code blocks, and heading.
function buildInputRules(schema) {
  var rules = smartQuotes.concat(ellipsis, emDash),
    type;
  if ((type = schema.nodes.blockquote)) {
    rules.push(blockQuoteRule(type));
  }
  if ((type = schema.nodes.ordered_list)) {
    rules.push(orderedListRule(type));
  }
  if ((type = schema.nodes.bullet_list)) {
    rules.push(bulletListRule(type));
  }
  if ((type = schema.nodes.code_block)) {
    rules.push(codeBlockRule(type));
  }
  if ((type = schema.nodes.heading)) {
    rules.push(headingRule(type, 6));
  }
  return inputRules({ rules: rules });
}

// !! This module exports helper functions for deriving a set of basic
// menu items, input rules, or key bindings from a schema. These
// values need to know about the schema for two reasons—they need
// access to specific instances of node and mark types, and they need
// to know which of the node and mark types that they know about are
// actually present in the schema.
//
// The `exampleSetup` plugin ties these together into a plugin that
// will automatically enable this basic functionality in an editor.

// :: (Object) → [Plugin]
// A convenience plugin that bundles together a simple menu with basic
// key bindings, input rules, and styling for the example schema.
// Probably only useful for quickly setting up a passable
// editor—you'll need more control over your settings in most
// real-world situations.
//
//   options::- The following options are recognized:
//
//     schema:: Schema
//     The schema to generate key bindings and menu items for.
//
//     mapKeys:: ?Object
//     Can be used to [adjust](#example-setup.buildKeymap) the key bindings created.
//
//     menuBar:: ?bool
//     Set to false to disable the menu bar.
//
//     history:: ?bool
//     Set to false to disable the history plugin.
//
//     floatingMenu:: ?bool
//     Set to false to make the menu bar non-floating.
//
//     menuContent:: [[MenuItem]]
//     Can be used to override the menu content.
function exampleSetup(options) {
  var plugins = [
    buildInputRules(options.schema),
    keymap(buildKeymap(options.schema, options.mapKeys)),
    keymap(baseKeymap),
    dropCursor(),
    gapCursor(),
  ];
  if (options.menuBar !== false) {
    plugins.push(
      menuBar({
        floating: options.floatingMenu !== false,
        content: options.menuContent || buildMenuItems(options.schema).fullMenu,
      }),
    );
  }
  if (options.history !== false) {
    plugins.push(history());
  }

  return plugins.concat(
    new Plugin({
      props: {
        attributes: { class: 'ProseMirror-example-setup-style' },
      },
    }),
  );
}

export { exampleSetup };
