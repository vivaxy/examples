import {
  F as Fragment,
  a as Slice,
  M as MarkType,
  R as ReplaceError,
  N as Node,
  b as Mark,
} from './index.es-76b61ec3.js';

// Mappable:: interface
// There are several things that positions can be mapped through.
// Such objects conform to this interface.
//
//   map:: (pos: number, assoc: ?number) → number
//   Map a position through this object. When given, `assoc` (should
//   be -1 or 1, defaults to 1) determines with which side the
//   position is associated, which determines in which direction to
//   move when a chunk of content is inserted at the mapped position.
//
//   mapResult:: (pos: number, assoc: ?number) → MapResult
//   Map a position, and return an object containing additional
//   information about the mapping. The result's `deleted` field tells
//   you whether the position was deleted (completely enclosed in a
//   replaced range) during the mapping. When content on only one side
//   is deleted, the position itself is only considered deleted when
//   `assoc` points in the direction of the deleted content.

// Recovery values encode a range index and an offset. They are
// represented as numbers, because tons of them will be created when
// mapping, for example, a large number of decorations. The number's
// lower 16 bits provide the index, the remaining bits the offset.
//
// Note: We intentionally don't use bit shift operators to en- and
// decode these, since those clip to 32 bits, which we might in rare
// cases want to overflow. A 64-bit float can represent 48-bit
// integers precisely.

var lower16 = 0xffff;
var factor16 = Math.pow(2, 16);

function makeRecover(index, offset) {
  return index + offset * factor16;
}
function recoverIndex(value) {
  return value & lower16;
}
function recoverOffset(value) {
  return (value - (value & lower16)) / factor16;
}

// ::- An object representing a mapped position with extra
// information.
var MapResult = function MapResult(pos, deleted, recover) {
  if (deleted === void 0) deleted = false;
  if (recover === void 0) recover = null;

  // :: number The mapped version of the position.
  this.pos = pos;
  // :: bool Tells you whether the position was deleted, that is,
  // whether the step removed its surroundings from the document.
  this.deleted = deleted;
  this.recover = recover;
};

// :: class extends Mappable
// A map describing the deletions and insertions made by a step, which
// can be used to find the correspondence between positions in the
// pre-step version of a document and the same position in the
// post-step version.
var StepMap = function StepMap(ranges, inverted) {
  if (inverted === void 0) inverted = false;

  this.ranges = ranges;
  this.inverted = inverted;
};

StepMap.prototype.recover = function recover(value) {
  var diff = 0,
    index = recoverIndex(value);
  if (!this.inverted) {
    for (var i = 0; i < index; i++) {
      diff += this.ranges[i * 3 + 2] - this.ranges[i * 3 + 1];
    }
  }
  return this.ranges[index * 3] + diff + recoverOffset(value);
};

// : (number, ?number) → MapResult
StepMap.prototype.mapResult = function mapResult(pos, assoc) {
  if (assoc === void 0) assoc = 1;
  return this._map(pos, assoc, false);
};

// : (number, ?number) → number
StepMap.prototype.map = function map(pos, assoc) {
  if (assoc === void 0) assoc = 1;
  return this._map(pos, assoc, true);
};

StepMap.prototype._map = function _map(pos, assoc, simple) {
  var diff = 0,
    oldIndex = this.inverted ? 2 : 1,
    newIndex = this.inverted ? 1 : 2;
  for (var i = 0; i < this.ranges.length; i += 3) {
    var start = this.ranges[i] - (this.inverted ? diff : 0);
    if (start > pos) {
      break;
    }
    var oldSize = this.ranges[i + oldIndex],
      newSize = this.ranges[i + newIndex],
      end = start + oldSize;
    if (pos <= end) {
      var side = !oldSize ? assoc : pos == start ? -1 : pos == end ? 1 : assoc;
      var result = start + diff + (side < 0 ? 0 : newSize);
      if (simple) {
        return result;
      }
      var recover =
        pos == (assoc < 0 ? start : end)
          ? null
          : makeRecover(i / 3, pos - start);
      return new MapResult(
        result,
        assoc < 0 ? pos != start : pos != end,
        recover,
      );
    }
    diff += newSize - oldSize;
  }
  return simple ? pos + diff : new MapResult(pos + diff);
};

StepMap.prototype.touches = function touches(pos, recover) {
  var diff = 0,
    index = recoverIndex(recover);
  var oldIndex = this.inverted ? 2 : 1,
    newIndex = this.inverted ? 1 : 2;
  for (var i = 0; i < this.ranges.length; i += 3) {
    var start = this.ranges[i] - (this.inverted ? diff : 0);
    if (start > pos) {
      break;
    }
    var oldSize = this.ranges[i + oldIndex],
      end = start + oldSize;
    if (pos <= end && i == index * 3) {
      return true;
    }
    diff += this.ranges[i + newIndex] - oldSize;
  }
  return false;
};

// :: ((oldStart: number, oldEnd: number, newStart: number, newEnd: number))
// Calls the given function on each of the changed ranges included in
// this map.
StepMap.prototype.forEach = function forEach(f) {
  var oldIndex = this.inverted ? 2 : 1,
    newIndex = this.inverted ? 1 : 2;
  for (var i = 0, diff = 0; i < this.ranges.length; i += 3) {
    var start = this.ranges[i],
      oldStart = start - (this.inverted ? diff : 0),
      newStart = start + (this.inverted ? 0 : diff);
    var oldSize = this.ranges[i + oldIndex],
      newSize = this.ranges[i + newIndex];
    f(oldStart, oldStart + oldSize, newStart, newStart + newSize);
    diff += newSize - oldSize;
  }
};

// :: () → StepMap
// Create an inverted version of this map. The result can be used to
// map positions in the post-step document to the pre-step document.
StepMap.prototype.invert = function invert() {
  return new StepMap(this.ranges, !this.inverted);
};

StepMap.prototype.toString = function toString() {
  return (this.inverted ? '-' : '') + JSON.stringify(this.ranges);
};

// :: (n: number) → StepMap
// Create a map that moves all positions by offset `n` (which may be
// negative). This can be useful when applying steps meant for a
// sub-document to a larger document, or vice-versa.
StepMap.offset = function offset(n) {
  return n == 0 ? StepMap.empty : new StepMap(n < 0 ? [0, -n, 0] : [0, 0, n]);
};

StepMap.empty = new StepMap([]);

// :: class extends Mappable
// A mapping represents a pipeline of zero or more [step
// maps](#transform.StepMap). It has special provisions for losslessly
// handling mapping positions through a series of steps in which some
// steps are inverted versions of earlier steps. (This comes up when
// ‘[rebasing](/docs/guide/#transform.rebasing)’ steps for
// collaboration or history management.)
var Mapping = function Mapping(maps, mirror, from, to) {
  // :: [StepMap]
  // The step maps in this mapping.
  this.maps = maps || [];
  // :: number
  // The starting position in the `maps` array, used when `map` or
  // `mapResult` is called.
  this.from = from || 0;
  // :: number
  // The end position in the `maps` array.
  this.to = to == null ? this.maps.length : to;
  this.mirror = mirror;
};

// :: (?number, ?number) → Mapping
// Create a mapping that maps only through a part of this one.
Mapping.prototype.slice = function slice(from, to) {
  if (from === void 0) from = 0;
  if (to === void 0) to = this.maps.length;

  return new Mapping(this.maps, this.mirror, from, to);
};

Mapping.prototype.copy = function copy() {
  return new Mapping(
    this.maps.slice(),
    this.mirror && this.mirror.slice(),
    this.from,
    this.to,
  );
};

// :: (StepMap, ?number)
// Add a step map to the end of this mapping. If `mirrors` is
// given, it should be the index of the step map that is the mirror
// image of this one.
Mapping.prototype.appendMap = function appendMap(map, mirrors) {
  this.to = this.maps.push(map);
  if (mirrors != null) {
    this.setMirror(this.maps.length - 1, mirrors);
  }
};

// :: (Mapping)
// Add all the step maps in a given mapping to this one (preserving
// mirroring information).
Mapping.prototype.appendMapping = function appendMapping(mapping) {
  for (var i = 0, startSize = this.maps.length; i < mapping.maps.length; i++) {
    var mirr = mapping.getMirror(i);
    this.appendMap(
      mapping.maps[i],
      mirr != null && mirr < i ? startSize + mirr : null,
    );
  }
};

// :: (number) → ?number
// Finds the offset of the step map that mirrors the map at the
// given offset, in this mapping (as per the second argument to
// `appendMap`).
Mapping.prototype.getMirror = function getMirror(n) {
  if (this.mirror) {
    for (var i = 0; i < this.mirror.length; i++) {
      if (this.mirror[i] == n) {
        return this.mirror[i + (i % 2 ? -1 : 1)];
      }
    }
  }
};

Mapping.prototype.setMirror = function setMirror(n, m) {
  if (!this.mirror) {
    this.mirror = [];
  }
  this.mirror.push(n, m);
};

// :: (Mapping)
// Append the inverse of the given mapping to this one.
Mapping.prototype.appendMappingInverted = function appendMappingInverted(
  mapping,
) {
  for (
    var i = mapping.maps.length - 1,
      totalSize = this.maps.length + mapping.maps.length;
    i >= 0;
    i--
  ) {
    var mirr = mapping.getMirror(i);
    this.appendMap(
      mapping.maps[i].invert(),
      mirr != null && mirr > i ? totalSize - mirr - 1 : null,
    );
  }
};

// :: () → Mapping
// Create an inverted version of this mapping.
Mapping.prototype.invert = function invert() {
  var inverse = new Mapping();
  inverse.appendMappingInverted(this);
  return inverse;
};

// : (number, ?number) → number
// Map a position through this mapping.
Mapping.prototype.map = function map(pos, assoc) {
  if (assoc === void 0) assoc = 1;

  if (this.mirror) {
    return this._map(pos, assoc, true);
  }
  for (var i = this.from; i < this.to; i++) {
    pos = this.maps[i].map(pos, assoc);
  }
  return pos;
};

// : (number, ?number) → MapResult
// Map a position through this mapping, returning a mapping
// result.
Mapping.prototype.mapResult = function mapResult(pos, assoc) {
  if (assoc === void 0) assoc = 1;
  return this._map(pos, assoc, false);
};

Mapping.prototype._map = function _map(pos, assoc, simple) {
  var deleted = false;

  for (var i = this.from; i < this.to; i++) {
    var map = this.maps[i],
      result = map.mapResult(pos, assoc);
    if (result.recover != null) {
      var corr = this.getMirror(i);
      if (corr != null && corr > i && corr < this.to) {
        i = corr;
        pos = this.maps[corr].recover(result.recover);
        continue;
      }
    }

    if (result.deleted) {
      deleted = true;
    }
    pos = result.pos;
  }

  return simple ? pos : new MapResult(pos, deleted);
};

function TransformError(message) {
  var err = Error.call(this, message);
  err.__proto__ = TransformError.prototype;
  return err;
}

TransformError.prototype = Object.create(Error.prototype);
TransformError.prototype.constructor = TransformError;
TransformError.prototype.name = 'TransformError';

// ::- Abstraction to build up and track an array of
// [steps](#transform.Step) representing a document transformation.
//
// Most transforming methods return the `Transform` object itself, so
// that they can be chained.
var Transform = function Transform(doc) {
  // :: Node
  // The current document (the result of applying the steps in the
  // transform).
  this.doc = doc;
  // :: [Step]
  // The steps in this transform.
  this.steps = [];
  // :: [Node]
  // The documents before each of the steps.
  this.docs = [];
  // :: Mapping
  // A mapping with the maps for each of the steps in this transform.
  this.mapping = new Mapping();
};

var prototypeAccessors$2 = {
  before: { configurable: true },
  docChanged: { configurable: true },
};

// :: Node The starting document.
prototypeAccessors$2.before.get = function () {
  return this.docs.length ? this.docs[0] : this.doc;
};

// :: (step: Step) → this
// Apply a new step in this transform, saving the result. Throws an
// error when the step fails.
Transform.prototype.step = function step(object) {
  var result = this.maybeStep(object);
  if (result.failed) {
    throw new TransformError(result.failed);
  }
  return this;
};

// :: (Step) → StepResult
// Try to apply a step in this transformation, ignoring it if it
// fails. Returns the step result.
Transform.prototype.maybeStep = function maybeStep(step) {
  var result = step.apply(this.doc);
  if (!result.failed) {
    this.addStep(step, result.doc);
  }
  return result;
};

// :: bool
// True when the document has been changed (when there are any
// steps).
prototypeAccessors$2.docChanged.get = function () {
  return this.steps.length > 0;
};

Transform.prototype.addStep = function addStep(step, doc) {
  this.docs.push(this.doc);
  this.steps.push(step);
  this.mapping.appendMap(step.getMap());
  this.doc = doc;
};

Object.defineProperties(Transform.prototype, prototypeAccessors$2);

function mustOverride() {
  throw new Error('Override me');
}

var stepsByID = Object.create(null);

// ::- A step object represents an atomic change. It generally applies
// only to the document it was created for, since the positions
// stored in it will only make sense for that document.
//
// New steps are defined by creating classes that extend `Step`,
// overriding the `apply`, `invert`, `map`, `getMap` and `fromJSON`
// methods, and registering your class with a unique
// JSON-serialization identifier using
// [`Step.jsonID`](#transform.Step^jsonID).
var Step = function Step() {};

Step.prototype.apply = function apply(_doc) {
  return mustOverride();
};

// :: () → StepMap
// Get the step map that represents the changes made by this step,
// and which can be used to transform between positions in the old
// and the new document.
Step.prototype.getMap = function getMap() {
  return StepMap.empty;
};

// :: (doc: Node) → Step
// Create an inverted version of this step. Needs the document as it
// was before the step as argument.
Step.prototype.invert = function invert(_doc) {
  return mustOverride();
};

// :: (mapping: Mappable) → ?Step
// Map this step through a mappable thing, returning either a
// version of that step with its positions adjusted, or `null` if
// the step was entirely deleted by the mapping.
Step.prototype.map = function map(_mapping) {
  return mustOverride();
};

// :: (other: Step) → ?Step
// Try to merge this step with another one, to be applied directly
// after it. Returns the merged step when possible, null if the
// steps can't be merged.
Step.prototype.merge = function merge(_other) {
  return null;
};

// :: () → Object
// Create a JSON-serializeable representation of this step. When
// defining this for a custom subclass, make sure the result object
// includes the step type's [JSON id](#transform.Step^jsonID) under
// the `stepType` property.
Step.prototype.toJSON = function toJSON() {
  return mustOverride();
};

// :: (Schema, Object) → Step
// Deserialize a step from its JSON representation. Will call
// through to the step class' own implementation of this method.
Step.fromJSON = function fromJSON(schema, json) {
  if (!json || !json.stepType) {
    throw new RangeError('Invalid input for Step.fromJSON');
  }
  var type = stepsByID[json.stepType];
  if (!type) {
    throw new RangeError('No step type ' + json.stepType + ' defined');
  }
  return type.fromJSON(schema, json);
};

// :: (string, constructor<Step>)
// To be able to serialize steps to JSON, each step needs a string
// ID to attach to its JSON representation. Use this method to
// register an ID for your step classes. Try to pick something
// that's unlikely to clash with steps from other modules.
Step.jsonID = function jsonID(id, stepClass) {
  if (id in stepsByID) {
    throw new RangeError('Duplicate use of step JSON ID ' + id);
  }
  stepsByID[id] = stepClass;
  stepClass.prototype.jsonID = id;
  return stepClass;
};

// ::- The result of [applying](#transform.Step.apply) a step. Contains either a
// new document or a failure value.
var StepResult = function StepResult(doc, failed) {
  // :: ?Node The transformed document.
  this.doc = doc;
  // :: ?string Text providing information about a failed step.
  this.failed = failed;
};

// :: (Node) → StepResult
// Create a successful step result.
StepResult.ok = function ok(doc) {
  return new StepResult(doc, null);
};

// :: (string) → StepResult
// Create a failed step result.
StepResult.fail = function fail(message) {
  return new StepResult(null, message);
};

// :: (Node, number, number, Slice) → StepResult
// Call [`Node.replace`](#model.Node.replace) with the given
// arguments. Create a successful result if it succeeds, and a
// failed one if it throws a `ReplaceError`.
StepResult.fromReplace = function fromReplace(doc, from, to, slice) {
  try {
    return StepResult.ok(doc.replace(from, to, slice));
  } catch (e) {
    if (e instanceof ReplaceError) {
      return StepResult.fail(e.message);
    }
    throw e;
  }
};

// ::- Replace a part of the document with a slice of new content.
var ReplaceStep = /*@__PURE__*/ (function (Step) {
  function ReplaceStep(from, to, slice, structure) {
    Step.call(this);
    // :: number
    // The start position of the replaced range.
    this.from = from;
    // :: number
    // The end position of the replaced range.
    this.to = to;
    // :: Slice
    // The slice to insert.
    this.slice = slice;
    this.structure = !!structure;
  }

  if (Step) ReplaceStep.__proto__ = Step;
  ReplaceStep.prototype = Object.create(Step && Step.prototype);
  ReplaceStep.prototype.constructor = ReplaceStep;

  ReplaceStep.prototype.apply = function apply(doc) {
    if (this.structure && contentBetween(doc, this.from, this.to)) {
      return StepResult.fail('Structure replace would overwrite content');
    }
    return StepResult.fromReplace(doc, this.from, this.to, this.slice);
  };

  ReplaceStep.prototype.getMap = function getMap() {
    return new StepMap([this.from, this.to - this.from, this.slice.size]);
  };

  ReplaceStep.prototype.invert = function invert(doc) {
    return new ReplaceStep(
      this.from,
      this.from + this.slice.size,
      doc.slice(this.from, this.to),
    );
  };

  ReplaceStep.prototype.map = function map(mapping) {
    var from = mapping.mapResult(this.from, 1),
      to = mapping.mapResult(this.to, -1);
    if (from.deleted && to.deleted) {
      return null;
    }
    return new ReplaceStep(from.pos, Math.max(from.pos, to.pos), this.slice);
  };

  ReplaceStep.prototype.merge = function merge(other) {
    if (!(other instanceof ReplaceStep) || other.structure || this.structure) {
      return null;
    }

    if (
      this.from + this.slice.size == other.from &&
      !this.slice.openEnd &&
      !other.slice.openStart
    ) {
      var slice =
        this.slice.size + other.slice.size == 0
          ? Slice.empty
          : new Slice(
              this.slice.content.append(other.slice.content),
              this.slice.openStart,
              other.slice.openEnd,
            );
      return new ReplaceStep(
        this.from,
        this.to + (other.to - other.from),
        slice,
        this.structure,
      );
    } else if (
      other.to == this.from &&
      !this.slice.openStart &&
      !other.slice.openEnd
    ) {
      var slice$1 =
        this.slice.size + other.slice.size == 0
          ? Slice.empty
          : new Slice(
              other.slice.content.append(this.slice.content),
              other.slice.openStart,
              this.slice.openEnd,
            );
      return new ReplaceStep(other.from, this.to, slice$1, this.structure);
    } else {
      return null;
    }
  };

  ReplaceStep.prototype.toJSON = function toJSON() {
    var json = { stepType: 'replace', from: this.from, to: this.to };
    if (this.slice.size) {
      json.slice = this.slice.toJSON();
    }
    if (this.structure) {
      json.structure = true;
    }
    return json;
  };

  ReplaceStep.fromJSON = function fromJSON(schema, json) {
    if (typeof json.from != 'number' || typeof json.to != 'number') {
      throw new RangeError('Invalid input for ReplaceStep.fromJSON');
    }
    return new ReplaceStep(
      json.from,
      json.to,
      Slice.fromJSON(schema, json.slice),
      !!json.structure,
    );
  };

  return ReplaceStep;
})(Step);

Step.jsonID('replace', ReplaceStep);

// ::- Replace a part of the document with a slice of content, but
// preserve a range of the replaced content by moving it into the
// slice.
var ReplaceAroundStep = /*@__PURE__*/ (function (Step) {
  function ReplaceAroundStep(
    from,
    to,
    gapFrom,
    gapTo,
    slice,
    insert,
    structure,
  ) {
    Step.call(this);
    // :: number
    // The start position of the replaced range.
    this.from = from;
    // :: number
    // The end position of the replaced range.
    this.to = to;
    // :: number
    // The start of preserved range.
    this.gapFrom = gapFrom;
    // :: number
    // The end of preserved range.
    this.gapTo = gapTo;
    // :: Slice
    // The slice to insert.
    this.slice = slice;
    // :: number
    // The position in the slice where the preserved range should be
    // inserted.
    this.insert = insert;
    this.structure = !!structure;
  }

  if (Step) ReplaceAroundStep.__proto__ = Step;
  ReplaceAroundStep.prototype = Object.create(Step && Step.prototype);
  ReplaceAroundStep.prototype.constructor = ReplaceAroundStep;

  ReplaceAroundStep.prototype.apply = function apply(doc) {
    if (
      this.structure &&
      (contentBetween(doc, this.from, this.gapFrom) ||
        contentBetween(doc, this.gapTo, this.to))
    ) {
      return StepResult.fail('Structure gap-replace would overwrite content');
    }

    var gap = doc.slice(this.gapFrom, this.gapTo);
    if (gap.openStart || gap.openEnd) {
      return StepResult.fail('Gap is not a flat range');
    }
    var inserted = this.slice.insertAt(this.insert, gap.content);
    if (!inserted) {
      return StepResult.fail('Content does not fit in gap');
    }
    return StepResult.fromReplace(doc, this.from, this.to, inserted);
  };

  ReplaceAroundStep.prototype.getMap = function getMap() {
    return new StepMap([
      this.from,
      this.gapFrom - this.from,
      this.insert,
      this.gapTo,
      this.to - this.gapTo,
      this.slice.size - this.insert,
    ]);
  };

  ReplaceAroundStep.prototype.invert = function invert(doc) {
    var gap = this.gapTo - this.gapFrom;
    return new ReplaceAroundStep(
      this.from,
      this.from + this.slice.size + gap,
      this.from + this.insert,
      this.from + this.insert + gap,
      doc
        .slice(this.from, this.to)
        .removeBetween(this.gapFrom - this.from, this.gapTo - this.from),
      this.gapFrom - this.from,
      this.structure,
    );
  };

  ReplaceAroundStep.prototype.map = function map(mapping) {
    var from = mapping.mapResult(this.from, 1),
      to = mapping.mapResult(this.to, -1);
    var gapFrom = mapping.map(this.gapFrom, -1),
      gapTo = mapping.map(this.gapTo, 1);
    if ((from.deleted && to.deleted) || gapFrom < from.pos || gapTo > to.pos) {
      return null;
    }
    return new ReplaceAroundStep(
      from.pos,
      to.pos,
      gapFrom,
      gapTo,
      this.slice,
      this.insert,
      this.structure,
    );
  };

  ReplaceAroundStep.prototype.toJSON = function toJSON() {
    var json = {
      stepType: 'replaceAround',
      from: this.from,
      to: this.to,
      gapFrom: this.gapFrom,
      gapTo: this.gapTo,
      insert: this.insert,
    };
    if (this.slice.size) {
      json.slice = this.slice.toJSON();
    }
    if (this.structure) {
      json.structure = true;
    }
    return json;
  };

  ReplaceAroundStep.fromJSON = function fromJSON(schema, json) {
    if (
      typeof json.from != 'number' ||
      typeof json.to != 'number' ||
      typeof json.gapFrom != 'number' ||
      typeof json.gapTo != 'number' ||
      typeof json.insert != 'number'
    ) {
      throw new RangeError('Invalid input for ReplaceAroundStep.fromJSON');
    }
    return new ReplaceAroundStep(
      json.from,
      json.to,
      json.gapFrom,
      json.gapTo,
      Slice.fromJSON(schema, json.slice),
      json.insert,
      !!json.structure,
    );
  };

  return ReplaceAroundStep;
})(Step);

Step.jsonID('replaceAround', ReplaceAroundStep);

function contentBetween(doc, from, to) {
  var $from = doc.resolve(from),
    dist = to - from,
    depth = $from.depth;
  while (
    dist > 0 &&
    depth > 0 &&
    $from.indexAfter(depth) == $from.node(depth).childCount
  ) {
    depth--;
    dist--;
  }
  if (dist > 0) {
    var next = $from.node(depth).maybeChild($from.indexAfter(depth));
    while (dist > 0) {
      if (!next || next.isLeaf) {
        return true;
      }
      next = next.firstChild;
      dist--;
    }
  }
  return false;
}

// :: (NodeRange, number) → this
// Split the content in the given range off from its parent, if there
// is sibling content before or after it, and move it up the tree to
// the depth specified by `target`. You'll probably want to use
// [`liftTarget`](#transform.liftTarget) to compute `target`, to make
// sure the lift is valid.
Transform.prototype.lift = function (range, target) {
  var $from = range.$from;
  var $to = range.$to;
  var depth = range.depth;

  var gapStart = $from.before(depth + 1),
    gapEnd = $to.after(depth + 1);
  var start = gapStart,
    end = gapEnd;

  var before = Fragment.empty,
    openStart = 0;
  for (var d = depth, splitting = false; d > target; d--) {
    if (splitting || $from.index(d) > 0) {
      splitting = true;
      before = Fragment.from($from.node(d).copy(before));
      openStart++;
    } else {
      start--;
    }
  }
  var after = Fragment.empty,
    openEnd = 0;
  for (var d$1 = depth, splitting$1 = false; d$1 > target; d$1--) {
    if (splitting$1 || $to.after(d$1 + 1) < $to.end(d$1)) {
      splitting$1 = true;
      after = Fragment.from($to.node(d$1).copy(after));
      openEnd++;
    } else {
      end++;
    }
  }

  return this.step(
    new ReplaceAroundStep(
      start,
      end,
      gapStart,
      gapEnd,
      new Slice(before.append(after), openStart, openEnd),
      before.size - openStart,
      true,
    ),
  );
};

// :: (NodeRange, [{type: NodeType, attrs: ?Object}]) → this
// Wrap the given [range](#model.NodeRange) in the given set of wrappers.
// The wrappers are assumed to be valid in this position, and should
// probably be computed with [`findWrapping`](#transform.findWrapping).
Transform.prototype.wrap = function (range, wrappers) {
  var content = Fragment.empty;
  for (var i = wrappers.length - 1; i >= 0; i--) {
    content = Fragment.from(
      wrappers[i].type.create(wrappers[i].attrs, content),
    );
  }

  var start = range.start,
    end = range.end;
  return this.step(
    new ReplaceAroundStep(
      start,
      end,
      start,
      end,
      new Slice(content, 0, 0),
      wrappers.length,
      true,
    ),
  );
};

// :: (number, ?number, NodeType, ?Object) → this
// Set the type of all textblocks (partly) between `from` and `to` to
// the given node type with the given attributes.
Transform.prototype.setBlockType = function (from, to, type, attrs) {
  var this$1 = this;
  if (to === void 0) to = from;

  if (!type.isTextblock) {
    throw new RangeError('Type given to setBlockType should be a textblock');
  }
  var mapFrom = this.steps.length;
  this.doc.nodesBetween(from, to, function (node, pos) {
    if (
      node.isTextblock &&
      !node.hasMarkup(type, attrs) &&
      canChangeType(this$1.doc, this$1.mapping.slice(mapFrom).map(pos), type)
    ) {
      // Ensure all markup that isn't allowed in the new node type is cleared
      this$1.clearIncompatible(this$1.mapping.slice(mapFrom).map(pos, 1), type);
      var mapping = this$1.mapping.slice(mapFrom);
      var startM = mapping.map(pos, 1),
        endM = mapping.map(pos + node.nodeSize, 1);
      this$1.step(
        new ReplaceAroundStep(
          startM,
          endM,
          startM + 1,
          endM - 1,
          new Slice(Fragment.from(type.create(attrs, null, node.marks)), 0, 0),
          1,
          true,
        ),
      );
      return false;
    }
  });
  return this;
};

function canChangeType(doc, pos, type) {
  var $pos = doc.resolve(pos),
    index = $pos.index();
  return $pos.parent.canReplaceWith(index, index + 1, type);
}

// :: (number, ?NodeType, ?Object, ?[Mark]) → this
// Change the type, attributes, and/or marks of the node at `pos`.
// When `type` isn't given, the existing node type is preserved,
Transform.prototype.setNodeMarkup = function (pos, type, attrs, marks) {
  var node = this.doc.nodeAt(pos);
  if (!node) {
    throw new RangeError('No node at given position');
  }
  if (!type) {
    type = node.type;
  }
  var newNode = type.create(attrs, null, marks || node.marks);
  if (node.isLeaf) {
    return this.replaceWith(pos, pos + node.nodeSize, newNode);
  }

  if (!type.validContent(node.content)) {
    throw new RangeError('Invalid content for node type ' + type.name);
  }

  return this.step(
    new ReplaceAroundStep(
      pos,
      pos + node.nodeSize,
      pos + 1,
      pos + node.nodeSize - 1,
      new Slice(Fragment.from(newNode), 0, 0),
      1,
      true,
    ),
  );
};

// :: (number, ?number, ?[?{type: NodeType, attrs: ?Object}]) → this
// Split the node at the given position, and optionally, if `depth` is
// greater than one, any number of nodes above that. By default, the
// parts split off will inherit the node type of the original node.
// This can be changed by passing an array of types and attributes to
// use after the split.
Transform.prototype.split = function (pos, depth, typesAfter) {
  if (depth === void 0) depth = 1;

  var $pos = this.doc.resolve(pos),
    before = Fragment.empty,
    after = Fragment.empty;
  for (
    var d = $pos.depth, e = $pos.depth - depth, i = depth - 1;
    d > e;
    d--, i--
  ) {
    before = Fragment.from($pos.node(d).copy(before));
    var typeAfter = typesAfter && typesAfter[i];
    after = Fragment.from(
      typeAfter
        ? typeAfter.type.create(typeAfter.attrs, after)
        : $pos.node(d).copy(after),
    );
  }
  return this.step(
    new ReplaceStep(
      pos,
      pos,
      new Slice(before.append(after), depth, depth),
      true,
    ),
  );
};

// :: (number, ?number) → this
// Join the blocks around the given position. If depth is 2, their
// last and first siblings are also joined, and so on.
Transform.prototype.join = function (pos, depth) {
  if (depth === void 0) depth = 1;

  var step = new ReplaceStep(pos - depth, pos + depth, Slice.empty, true);
  return this.step(step);
};

// :: (Node, number, NodeType) → ?number
// Try to find a point where a node of the given type can be inserted
// near `pos`, by searching up the node hierarchy when `pos` itself
// isn't a valid place but is at the start or end of a node. Return
// null if no position was found.
function insertPoint(doc, pos, nodeType) {
  var $pos = doc.resolve(pos);
  if ($pos.parent.canReplaceWith($pos.index(), $pos.index(), nodeType)) {
    return pos;
  }

  if ($pos.parentOffset == 0) {
    for (var d = $pos.depth - 1; d >= 0; d--) {
      var index = $pos.index(d);
      if ($pos.node(d).canReplaceWith(index, index, nodeType)) {
        return $pos.before(d + 1);
      }
      if (index > 0) {
        return null;
      }
    }
  }
  if ($pos.parentOffset == $pos.parent.content.size) {
    for (var d$1 = $pos.depth - 1; d$1 >= 0; d$1--) {
      var index$1 = $pos.indexAfter(d$1);
      if ($pos.node(d$1).canReplaceWith(index$1, index$1, nodeType)) {
        return $pos.after(d$1 + 1);
      }
      if (index$1 < $pos.node(d$1).childCount) {
        return null;
      }
    }
  }
}

// :: (Node, number, Slice) → ?number
// Finds a position at or around the given position where the given
// slice can be inserted. Will look at parent nodes' nearest boundary
// and try there, even if the original position wasn't directly at the
// start or end of that node. Returns null when no position was found.
function dropPoint(doc, pos, slice) {
  var $pos = doc.resolve(pos);
  if (!slice.content.size) {
    return pos;
  }
  var content = slice.content;
  for (var i = 0; i < slice.openStart; i++) {
    content = content.firstChild.content;
  }
  for (
    var pass = 1;
    pass <= (slice.openStart == 0 && slice.size ? 2 : 1);
    pass++
  ) {
    for (var d = $pos.depth; d >= 0; d--) {
      var bias =
        d == $pos.depth
          ? 0
          : $pos.pos <= ($pos.start(d + 1) + $pos.end(d + 1)) / 2
          ? -1
          : 1;
      var insertPos = $pos.index(d) + (bias > 0 ? 1 : 0);
      var parent = $pos.node(d),
        fits = false;
      if (pass == 1) {
        fits = parent.canReplace(insertPos, insertPos, content);
      } else {
        var wrapping = parent
          .contentMatchAt(insertPos)
          .findWrapping(content.firstChild.type);
        fits =
          wrapping && parent.canReplaceWith(insertPos, insertPos, wrapping[0]);
      }
      if (fits) {
        return bias == 0
          ? $pos.pos
          : bias < 0
          ? $pos.before(d + 1)
          : $pos.after(d + 1);
      }
    }
  }
  return null;
}

function mapFragment(fragment, f, parent) {
  var mapped = [];
  for (var i = 0; i < fragment.childCount; i++) {
    var child = fragment.child(i);
    if (child.content.size) {
      child = child.copy(mapFragment(child.content, f, child));
    }
    if (child.isInline) {
      child = f(child, parent, i);
    }
    mapped.push(child);
  }
  return Fragment.fromArray(mapped);
}

// ::- Add a mark to all inline content between two positions.
var AddMarkStep = /*@__PURE__*/ (function (Step) {
  function AddMarkStep(from, to, mark) {
    Step.call(this);
    // :: number
    // The start of the marked range.
    this.from = from;
    // :: number
    // The end of the marked range.
    this.to = to;
    // :: Mark
    // The mark to add.
    this.mark = mark;
  }

  if (Step) AddMarkStep.__proto__ = Step;
  AddMarkStep.prototype = Object.create(Step && Step.prototype);
  AddMarkStep.prototype.constructor = AddMarkStep;

  AddMarkStep.prototype.apply = function apply(doc) {
    var this$1 = this;

    var oldSlice = doc.slice(this.from, this.to),
      $from = doc.resolve(this.from);
    var parent = $from.node($from.sharedDepth(this.to));
    var slice = new Slice(
      mapFragment(
        oldSlice.content,
        function (node, parent) {
          if (!node.isAtom || !parent.type.allowsMarkType(this$1.mark.type)) {
            return node;
          }
          return node.mark(this$1.mark.addToSet(node.marks));
        },
        parent,
      ),
      oldSlice.openStart,
      oldSlice.openEnd,
    );
    return StepResult.fromReplace(doc, this.from, this.to, slice);
  };

  AddMarkStep.prototype.invert = function invert() {
    return new RemoveMarkStep(this.from, this.to, this.mark);
  };

  AddMarkStep.prototype.map = function map(mapping) {
    var from = mapping.mapResult(this.from, 1),
      to = mapping.mapResult(this.to, -1);
    if ((from.deleted && to.deleted) || from.pos >= to.pos) {
      return null;
    }
    return new AddMarkStep(from.pos, to.pos, this.mark);
  };

  AddMarkStep.prototype.merge = function merge(other) {
    if (
      other instanceof AddMarkStep &&
      other.mark.eq(this.mark) &&
      this.from <= other.to &&
      this.to >= other.from
    ) {
      return new AddMarkStep(
        Math.min(this.from, other.from),
        Math.max(this.to, other.to),
        this.mark,
      );
    }
  };

  AddMarkStep.prototype.toJSON = function toJSON() {
    return {
      stepType: 'addMark',
      mark: this.mark.toJSON(),
      from: this.from,
      to: this.to,
    };
  };

  AddMarkStep.fromJSON = function fromJSON(schema, json) {
    if (typeof json.from != 'number' || typeof json.to != 'number') {
      throw new RangeError('Invalid input for AddMarkStep.fromJSON');
    }
    return new AddMarkStep(json.from, json.to, schema.markFromJSON(json.mark));
  };

  return AddMarkStep;
})(Step);

Step.jsonID('addMark', AddMarkStep);

// ::- Remove a mark from all inline content between two positions.
var RemoveMarkStep = /*@__PURE__*/ (function (Step) {
  function RemoveMarkStep(from, to, mark) {
    Step.call(this);
    // :: number
    // The start of the unmarked range.
    this.from = from;
    // :: number
    // The end of the unmarked range.
    this.to = to;
    // :: Mark
    // The mark to remove.
    this.mark = mark;
  }

  if (Step) RemoveMarkStep.__proto__ = Step;
  RemoveMarkStep.prototype = Object.create(Step && Step.prototype);
  RemoveMarkStep.prototype.constructor = RemoveMarkStep;

  RemoveMarkStep.prototype.apply = function apply(doc) {
    var this$1 = this;

    var oldSlice = doc.slice(this.from, this.to);
    var slice = new Slice(
      mapFragment(oldSlice.content, function (node) {
        return node.mark(this$1.mark.removeFromSet(node.marks));
      }),
      oldSlice.openStart,
      oldSlice.openEnd,
    );
    return StepResult.fromReplace(doc, this.from, this.to, slice);
  };

  RemoveMarkStep.prototype.invert = function invert() {
    return new AddMarkStep(this.from, this.to, this.mark);
  };

  RemoveMarkStep.prototype.map = function map(mapping) {
    var from = mapping.mapResult(this.from, 1),
      to = mapping.mapResult(this.to, -1);
    if ((from.deleted && to.deleted) || from.pos >= to.pos) {
      return null;
    }
    return new RemoveMarkStep(from.pos, to.pos, this.mark);
  };

  RemoveMarkStep.prototype.merge = function merge(other) {
    if (
      other instanceof RemoveMarkStep &&
      other.mark.eq(this.mark) &&
      this.from <= other.to &&
      this.to >= other.from
    ) {
      return new RemoveMarkStep(
        Math.min(this.from, other.from),
        Math.max(this.to, other.to),
        this.mark,
      );
    }
  };

  RemoveMarkStep.prototype.toJSON = function toJSON() {
    return {
      stepType: 'removeMark',
      mark: this.mark.toJSON(),
      from: this.from,
      to: this.to,
    };
  };

  RemoveMarkStep.fromJSON = function fromJSON(schema, json) {
    if (typeof json.from != 'number' || typeof json.to != 'number') {
      throw new RangeError('Invalid input for RemoveMarkStep.fromJSON');
    }
    return new RemoveMarkStep(
      json.from,
      json.to,
      schema.markFromJSON(json.mark),
    );
  };

  return RemoveMarkStep;
})(Step);

Step.jsonID('removeMark', RemoveMarkStep);

// :: (number, number, Mark) → this
// Add the given mark to the inline content between `from` and `to`.
Transform.prototype.addMark = function (from, to, mark) {
  var this$1 = this;

  var removed = [],
    added = [],
    removing = null,
    adding = null;
  this.doc.nodesBetween(from, to, function (node, pos, parent) {
    if (!node.isInline) {
      return;
    }
    var marks = node.marks;
    if (!mark.isInSet(marks) && parent.type.allowsMarkType(mark.type)) {
      var start = Math.max(pos, from),
        end = Math.min(pos + node.nodeSize, to);
      var newSet = mark.addToSet(marks);

      for (var i = 0; i < marks.length; i++) {
        if (!marks[i].isInSet(newSet)) {
          if (removing && removing.to == start && removing.mark.eq(marks[i])) {
            removing.to = end;
          } else {
            removed.push((removing = new RemoveMarkStep(start, end, marks[i])));
          }
        }
      }

      if (adding && adding.to == start) {
        adding.to = end;
      } else {
        added.push((adding = new AddMarkStep(start, end, mark)));
      }
    }
  });

  removed.forEach(function (s) {
    return this$1.step(s);
  });
  added.forEach(function (s) {
    return this$1.step(s);
  });
  return this;
};

// :: (number, number, ?union<Mark, MarkType>) → this
// Remove marks from inline nodes between `from` and `to`. When `mark`
// is a single mark, remove precisely that mark. When it is a mark type,
// remove all marks of that type. When it is null, remove all marks of
// any type.
Transform.prototype.removeMark = function (from, to, mark) {
  var this$1 = this;
  if (mark === void 0) mark = null;

  var matched = [],
    step = 0;
  this.doc.nodesBetween(from, to, function (node, pos) {
    if (!node.isInline) {
      return;
    }
    step++;
    var toRemove = null;
    if (mark instanceof MarkType) {
      var set = node.marks,
        found;
      while ((found = mark.isInSet(set))) {
        (toRemove || (toRemove = [])).push(found);
        set = found.removeFromSet(set);
      }
    } else if (mark) {
      if (mark.isInSet(node.marks)) {
        toRemove = [mark];
      }
    } else {
      toRemove = node.marks;
    }
    if (toRemove && toRemove.length) {
      var end = Math.min(pos + node.nodeSize, to);
      for (var i = 0; i < toRemove.length; i++) {
        var style = toRemove[i],
          found$1 = void 0;
        for (var j = 0; j < matched.length; j++) {
          var m = matched[j];
          if (m.step == step - 1 && style.eq(matched[j].style)) {
            found$1 = m;
          }
        }
        if (found$1) {
          found$1.to = end;
          found$1.step = step;
        } else {
          matched.push({
            style: style,
            from: Math.max(pos, from),
            to: end,
            step: step,
          });
        }
      }
    }
  });
  matched.forEach(function (m) {
    return this$1.step(new RemoveMarkStep(m.from, m.to, m.style));
  });
  return this;
};

// :: (number, NodeType, ?ContentMatch) → this
// Removes all marks and nodes from the content of the node at `pos`
// that don't match the given new parent node type. Accepts an
// optional starting [content match](#model.ContentMatch) as third
// argument.
Transform.prototype.clearIncompatible = function (pos, parentType, match) {
  if (match === void 0) match = parentType.contentMatch;

  var node = this.doc.nodeAt(pos);
  var delSteps = [],
    cur = pos + 1;
  for (var i = 0; i < node.childCount; i++) {
    var child = node.child(i),
      end = cur + child.nodeSize;
    var allowed = match.matchType(child.type, child.attrs);
    if (!allowed) {
      delSteps.push(new ReplaceStep(cur, end, Slice.empty));
    } else {
      match = allowed;
      for (var j = 0; j < child.marks.length; j++) {
        if (!parentType.allowsMarkType(child.marks[j].type)) {
          this.step(new RemoveMarkStep(cur, end, child.marks[j]));
        }
      }
    }
    cur = end;
  }
  if (!match.validEnd) {
    var fill = match.fillBefore(Fragment.empty, true);
    this.replace(cur, cur, new Slice(fill, 0, 0));
  }
  for (var i$1 = delSteps.length - 1; i$1 >= 0; i$1--) {
    this.step(delSteps[i$1]);
  }
  return this;
};

// :: (Node, number, ?number, ?Slice) → ?Step
// ‘Fit’ a slice into a given position in the document, producing a
// [step](#transform.Step) that inserts it. Will return null if
// there's no meaningful way to insert the slice here, or inserting it
// would be a no-op (an empty slice over an empty range).
function replaceStep(doc, from, to, slice) {
  if (to === void 0) to = from;
  if (slice === void 0) slice = Slice.empty;

  if (from == to && !slice.size) {
    return null;
  }

  var $from = doc.resolve(from),
    $to = doc.resolve(to);
  // Optimization -- avoid work if it's obvious that it's not needed.
  if (fitsTrivially($from, $to, slice)) {
    return new ReplaceStep(from, to, slice);
  }
  return new Fitter($from, $to, slice).fit();
}

// :: (number, ?number, ?Slice) → this
// Replace the part of the document between `from` and `to` with the
// given `slice`.
Transform.prototype.replace = function (from, to, slice) {
  if (to === void 0) to = from;
  if (slice === void 0) slice = Slice.empty;

  var step = replaceStep(this.doc, from, to, slice);
  if (step) {
    this.step(step);
  }
  return this;
};

// :: (number, number, union<Fragment, Node, [Node]>) → this
// Replace the given range with the given content, which may be a
// fragment, node, or array of nodes.
Transform.prototype.replaceWith = function (from, to, content) {
  return this.replace(from, to, new Slice(Fragment.from(content), 0, 0));
};

// :: (number, number) → this
// Delete the content between the given positions.
Transform.prototype.delete = function (from, to) {
  return this.replace(from, to, Slice.empty);
};

// :: (number, union<Fragment, Node, [Node]>) → this
// Insert the given content at the given position.
Transform.prototype.insert = function (pos, content) {
  return this.replaceWith(pos, pos, content);
};

function fitsTrivially($from, $to, slice) {
  return (
    !slice.openStart &&
    !slice.openEnd &&
    $from.start() == $to.start() &&
    $from.parent.canReplace($from.index(), $to.index(), slice.content)
  );
}

// Algorithm for 'placing' the elements of a slice into a gap:
//
// We consider the content of each node that is open to the left to be
// independently placeable. I.e. in <p("foo"), p("bar")>, when the
// paragraph on the left is open, "foo" can be placed (somewhere on
// the left side of the replacement gap) independently from p("bar").
//
// This class tracks the state of the placement progress in the
// following properties:
//
//  - `frontier` holds a stack of `{type, match}` objects that
//    represent the open side of the replacement. It starts at
//    `$from`, then moves forward as content is placed, and is finally
//    reconciled with `$to`.
//
//  - `unplaced` is a slice that represents the content that hasn't
//    been placed yet.
//
//  - `placed` is a fragment of placed content. Its open-start value
//    is implicit in `$from`, and its open-end value in `frontier`.
var Fitter = function Fitter($from, $to, slice) {
  this.$to = $to;
  this.$from = $from;
  this.unplaced = slice;

  this.frontier = [];
  for (var i = 0; i <= $from.depth; i++) {
    var node = $from.node(i);
    this.frontier.push({
      type: node.type,
      match: node.contentMatchAt($from.indexAfter(i)),
    });
  }

  this.placed = Fragment.empty;
  for (var i$1 = $from.depth; i$1 > 0; i$1--) {
    this.placed = Fragment.from($from.node(i$1).copy(this.placed));
  }
};

var prototypeAccessors$1$1 = { depth: { configurable: true } };

prototypeAccessors$1$1.depth.get = function () {
  return this.frontier.length - 1;
};

Fitter.prototype.fit = function fit() {
  // As long as there's unplaced content, try to place some of it.
  // If that fails, either increase the open score of the unplaced
  // slice, or drop nodes from it, and then try again.
  while (this.unplaced.size) {
    var fit = this.findFittable();
    if (fit) {
      this.placeNodes(fit);
    } else {
      this.openMore() || this.dropNode();
    }
  }
  // When there's inline content directly after the frontier _and_
  // directly after `this.$to`, we must generate a `ReplaceAround`
  // step that pulls that content into the node after the frontier.
  // That means the fitting must be done to the end of the textblock
  // node after `this.$to`, not `this.$to` itself.
  var moveInline = this.mustMoveInline(),
    placedSize = this.placed.size - this.depth - this.$from.depth;
  var $from = this.$from,
    $to = this.close(moveInline < 0 ? this.$to : $from.doc.resolve(moveInline));
  if (!$to) {
    return null;
  }

  // If closing to `$to` succeeded, create a step
  var content = this.placed,
    openStart = $from.depth,
    openEnd = $to.depth;
  while (openStart && openEnd && content.childCount == 1) {
    // Normalize by dropping open parent nodes
    content = content.firstChild.content;
    openStart--;
    openEnd--;
  }
  var slice = new Slice(content, openStart, openEnd);
  if (moveInline > -1) {
    return new ReplaceAroundStep(
      $from.pos,
      moveInline,
      this.$to.pos,
      this.$to.end(),
      slice,
      placedSize,
    );
  }
  if (slice.size || $from.pos != this.$to.pos) {
    // Don't generate no-op steps
    return new ReplaceStep($from.pos, $to.pos, slice);
  }
};

// Find a position on the start spine of `this.unplaced` that has
// content that can be moved somewhere on the frontier. Returns two
// depths, one for the slice and one for the frontier.
Fitter.prototype.findFittable = function findFittable() {
  // Only try wrapping nodes (pass 2) after finding a place without
  // wrapping failed.
  for (var pass = 1; pass <= 2; pass++) {
    for (
      var sliceDepth = this.unplaced.openStart;
      sliceDepth >= 0;
      sliceDepth--
    ) {
      var fragment = void 0,
        parent = void 0;
      if (sliceDepth) {
        parent = contentAt(this.unplaced.content, sliceDepth - 1).firstChild;
        fragment = parent.content;
      } else {
        fragment = this.unplaced.content;
      }
      var first = fragment.firstChild;
      for (
        var frontierDepth = this.depth;
        frontierDepth >= 0;
        frontierDepth--
      ) {
        var ref = this.frontier[frontierDepth];
        var type = ref.type;
        var match = ref.match;
        var wrap = void 0,
          inject = void 0;
        // In pass 1, if the next node matches, or there is no next
        // node but the parents look compatible, we've found a
        // place.
        if (
          pass == 1 &&
          (first
            ? match.matchType(first.type) ||
              (inject = match.fillBefore(Fragment.from(first), false))
            : type.compatibleContent(parent.type))
        ) {
          return {
            sliceDepth: sliceDepth,
            frontierDepth: frontierDepth,
            parent: parent,
            inject: inject,
          };
        }
        // In pass 2, look for a set of wrapping nodes that make
        // `first` fit here.
        else if (
          pass == 2 &&
          first &&
          (wrap = match.findWrapping(first.type))
        ) {
          return {
            sliceDepth: sliceDepth,
            frontierDepth: frontierDepth,
            parent: parent,
            wrap: wrap,
          };
        }
        // Don't continue looking further up if the parent node
        // would fit here.
        if (parent && match.matchType(parent.type)) {
          break;
        }
      }
    }
  }
};

Fitter.prototype.openMore = function openMore() {
  var ref = this.unplaced;
  var content = ref.content;
  var openStart = ref.openStart;
  var openEnd = ref.openEnd;
  var inner = contentAt(content, openStart);
  if (!inner.childCount || inner.firstChild.isLeaf) {
    return false;
  }
  this.unplaced = new Slice(
    content,
    openStart + 1,
    Math.max(
      openEnd,
      inner.size + openStart >= content.size - openEnd ? openStart + 1 : 0,
    ),
  );
  return true;
};

Fitter.prototype.dropNode = function dropNode() {
  var ref = this.unplaced;
  var content = ref.content;
  var openStart = ref.openStart;
  var openEnd = ref.openEnd;
  var inner = contentAt(content, openStart);
  if (inner.childCount <= 1 && openStart > 0) {
    var openAtEnd = content.size - openStart <= openStart + inner.size;
    this.unplaced = new Slice(
      dropFromFragment(content, openStart - 1, 1),
      openStart - 1,
      openAtEnd ? openStart - 1 : openEnd,
    );
  } else {
    this.unplaced = new Slice(
      dropFromFragment(content, openStart, 1),
      openStart,
      openEnd,
    );
  }
};

// : ({sliceDepth: number, frontierDepth: number, parent: ?Node, wrap: ?[NodeType], inject: ?Fragment})
// Move content from the unplaced slice at `sliceDepth` to the
// frontier node at `frontierDepth`. Close that frontier node when
// applicable.
Fitter.prototype.placeNodes = function placeNodes(ref) {
  var sliceDepth = ref.sliceDepth;
  var frontierDepth = ref.frontierDepth;
  var parent = ref.parent;
  var inject = ref.inject;
  var wrap = ref.wrap;

  while (this.depth > frontierDepth) {
    this.closeFrontierNode();
  }
  if (wrap) {
    for (var i = 0; i < wrap.length; i++) {
      this.openFrontierNode(wrap[i]);
    }
  }

  var slice = this.unplaced,
    fragment = parent ? parent.content : slice.content;
  var openStart = slice.openStart - sliceDepth;
  var taken = 0,
    add = [];
  var ref$1 = this.frontier[frontierDepth];
  var match = ref$1.match;
  var type = ref$1.type;
  if (inject) {
    for (var i$1 = 0; i$1 < inject.childCount; i$1++) {
      add.push(inject.child(i$1));
    }
    match = match.matchFragment(inject);
  }
  // Computes the amount of (end) open nodes at the end of the
  // fragment. When 0, the parent is open, but no more. When
  // negative, nothing is open.
  var openEndCount =
    fragment.size + sliceDepth - (slice.content.size - slice.openEnd);
  // Scan over the fragment, fitting as many child nodes as
  // possible.
  while (taken < fragment.childCount) {
    var next = fragment.child(taken),
      matches = match.matchType(next.type);
    if (!matches) {
      break;
    }
    taken++;
    if (taken > 1 || openStart == 0 || next.content.size) {
      // Drop empty open nodes
      match = matches;
      add.push(
        closeNodeStart(
          next.mark(type.allowedMarks(next.marks)),
          taken == 1 ? openStart : 0,
          taken == fragment.childCount ? openEndCount : -1,
        ),
      );
    }
  }
  var toEnd = taken == fragment.childCount;
  if (!toEnd) {
    openEndCount = -1;
  }

  this.placed = addToFragment(this.placed, frontierDepth, Fragment.from(add));
  this.frontier[frontierDepth].match = match;

  // If the parent types match, and the entire node was moved, and
  // it's not open, close this frontier node right away.
  if (
    toEnd &&
    openEndCount < 0 &&
    parent &&
    parent.type == this.frontier[this.depth].type &&
    this.frontier.length > 1
  ) {
    this.closeFrontierNode();
  }

  // Add new frontier nodes for any open nodes at the end.
  for (var i$2 = 0, cur = fragment; i$2 < openEndCount; i$2++) {
    var node = cur.lastChild;
    this.frontier.push({
      type: node.type,
      match: node.contentMatchAt(node.childCount),
    });
    cur = node.content;
  }

  // Update `this.unplaced`. Drop the entire node from which we
  // placed it we got to its end, otherwise just drop the placed
  // nodes.
  this.unplaced = !toEnd
    ? new Slice(
        dropFromFragment(slice.content, sliceDepth, taken),
        slice.openStart,
        slice.openEnd,
      )
    : sliceDepth == 0
    ? Slice.empty
    : new Slice(
        dropFromFragment(slice.content, sliceDepth - 1, 1),
        sliceDepth - 1,
        openEndCount < 0 ? slice.openEnd : sliceDepth - 1,
      );
};

Fitter.prototype.mustMoveInline = function mustMoveInline() {
  if (!this.$to.parent.isTextblock || this.$to.end() == this.$to.pos) {
    return -1;
  }
  var top = this.frontier[this.depth],
    level;
  if (
    !top.type.isTextblock ||
    !contentAfterFits(this.$to, this.$to.depth, top.type, top.match, false) ||
    (this.$to.depth == this.depth &&
      (level = this.findCloseLevel(this.$to)) &&
      level.depth == this.depth)
  ) {
    return -1;
  }

  var ref = this.$to;
  var depth = ref.depth;
  var after = this.$to.after(depth);
  while (depth > 1 && after == this.$to.end(--depth)) {
    ++after;
  }
  return after;
};

Fitter.prototype.findCloseLevel = function findCloseLevel($to) {
  scan: for (var i = Math.min(this.depth, $to.depth); i >= 0; i--) {
    var ref = this.frontier[i];
    var match = ref.match;
    var type = ref.type;
    var dropInner =
      i < $to.depth && $to.end(i + 1) == $to.pos + ($to.depth - (i + 1));
    var fit = contentAfterFits($to, i, type, match, dropInner);
    if (!fit) {
      continue;
    }
    for (var d = i - 1; d >= 0; d--) {
      var ref$1 = this.frontier[d];
      var match$1 = ref$1.match;
      var type$1 = ref$1.type;
      var matches = contentAfterFits($to, d, type$1, match$1, true);
      if (!matches || matches.childCount) {
        continue scan;
      }
    }
    return {
      depth: i,
      fit: fit,
      move: dropInner ? $to.doc.resolve($to.after(i + 1)) : $to,
    };
  }
};

Fitter.prototype.close = function close($to) {
  var close = this.findCloseLevel($to);
  if (!close) {
    return null;
  }

  while (this.depth > close.depth) {
    this.closeFrontierNode();
  }
  if (close.fit.childCount) {
    this.placed = addToFragment(this.placed, close.depth, close.fit);
  }
  $to = close.move;
  for (var d = close.depth + 1; d <= $to.depth; d++) {
    var node = $to.node(d),
      add = node.type.contentMatch.fillBefore(node.content, true, $to.index(d));
    this.openFrontierNode(node.type, node.attrs, add);
  }
  return $to;
};

Fitter.prototype.openFrontierNode = function openFrontierNode(
  type,
  attrs,
  content,
) {
  var top = this.frontier[this.depth];
  top.match = top.match.matchType(type);
  this.placed = addToFragment(
    this.placed,
    this.depth,
    Fragment.from(type.create(attrs, content)),
  );
  this.frontier.push({ type: type, match: type.contentMatch });
};

Fitter.prototype.closeFrontierNode = function closeFrontierNode() {
  var open = this.frontier.pop();
  var add = open.match.fillBefore(Fragment.empty, true);
  if (add.childCount) {
    this.placed = addToFragment(this.placed, this.frontier.length, add);
  }
};

Object.defineProperties(Fitter.prototype, prototypeAccessors$1$1);

function dropFromFragment(fragment, depth, count) {
  if (depth == 0) {
    return fragment.cutByIndex(count);
  }
  return fragment.replaceChild(
    0,
    fragment.firstChild.copy(
      dropFromFragment(fragment.firstChild.content, depth - 1, count),
    ),
  );
}

function addToFragment(fragment, depth, content) {
  if (depth == 0) {
    return fragment.append(content);
  }
  return fragment.replaceChild(
    fragment.childCount - 1,
    fragment.lastChild.copy(
      addToFragment(fragment.lastChild.content, depth - 1, content),
    ),
  );
}

function contentAt(fragment, depth) {
  for (var i = 0; i < depth; i++) {
    fragment = fragment.firstChild.content;
  }
  return fragment;
}

function closeNodeStart(node, openStart, openEnd) {
  if (openStart <= 0) {
    return node;
  }
  var frag = node.content;
  if (openStart > 1) {
    frag = frag.replaceChild(
      0,
      closeNodeStart(
        frag.firstChild,
        openStart - 1,
        frag.childCount == 1 ? openEnd - 1 : 0,
      ),
    );
  }
  if (openStart > 0) {
    frag = node.type.contentMatch.fillBefore(frag).append(frag);
    if (openEnd <= 0) {
      frag = frag.append(
        node.type.contentMatch
          .matchFragment(frag)
          .fillBefore(Fragment.empty, true),
      );
    }
  }
  return node.copy(frag);
}

function contentAfterFits($to, depth, type, match, open) {
  var node = $to.node(depth),
    index = open ? $to.indexAfter(depth) : $to.index(depth);
  if (index == node.childCount && !type.compatibleContent(node.type)) {
    return null;
  }
  var fit = match.fillBefore(node.content, true, index);
  return fit && !invalidMarks(type, node.content, index) ? fit : null;
}

function invalidMarks(type, fragment, start) {
  for (var i = start; i < fragment.childCount; i++) {
    if (!type.allowsMarks(fragment.child(i).marks)) {
      return true;
    }
  }
  return false;
}

// :: (number, number, Slice) → this
// Replace a range of the document with a given slice, using `from`,
// `to`, and the slice's [`openStart`](#model.Slice.openStart) property
// as hints, rather than fixed start and end points. This method may
// grow the replaced area or close open nodes in the slice in order to
// get a fit that is more in line with WYSIWYG expectations, by
// dropping fully covered parent nodes of the replaced region when
// they are marked [non-defining](#model.NodeSpec.defining), or
// including an open parent node from the slice that _is_ marked as
// [defining](#model.NodeSpec.defining).
//
// This is the method, for example, to handle paste. The similar
// [`replace`](#transform.Transform.replace) method is a more
// primitive tool which will _not_ move the start and end of its given
// range, and is useful in situations where you need more precise
// control over what happens.
Transform.prototype.replaceRange = function (from, to, slice) {
  if (!slice.size) {
    return this.deleteRange(from, to);
  }

  var $from = this.doc.resolve(from),
    $to = this.doc.resolve(to);
  if (fitsTrivially($from, $to, slice)) {
    return this.step(new ReplaceStep(from, to, slice));
  }

  var targetDepths = coveredDepths($from, this.doc.resolve(to));
  // Can't replace the whole document, so remove 0 if it's present
  if (targetDepths[targetDepths.length - 1] == 0) {
    targetDepths.pop();
  }
  // Negative numbers represent not expansion over the whole node at
  // that depth, but replacing from $from.before(-D) to $to.pos.
  var preferredTarget = -($from.depth + 1);
  targetDepths.unshift(preferredTarget);
  // This loop picks a preferred target depth, if one of the covering
  // depths is not outside of a defining node, and adds negative
  // depths for any depth that has $from at its start and does not
  // cross a defining node.
  for (var d = $from.depth, pos = $from.pos - 1; d > 0; d--, pos--) {
    var spec = $from.node(d).type.spec;
    if (spec.defining || spec.isolating) {
      break;
    }
    if (targetDepths.indexOf(d) > -1) {
      preferredTarget = d;
    } else if ($from.before(d) == pos) {
      targetDepths.splice(1, 0, -d);
    }
  }
  // Try to fit each possible depth of the slice into each possible
  // target depth, starting with the preferred depths.
  var preferredTargetIndex = targetDepths.indexOf(preferredTarget);

  var leftNodes = [],
    preferredDepth = slice.openStart;
  for (var content = slice.content, i = 0; ; i++) {
    var node = content.firstChild;
    leftNodes.push(node);
    if (i == slice.openStart) {
      break;
    }
    content = node.content;
  }
  // Back up if the node directly above openStart, or the node above
  // that separated only by a non-defining textblock node, is defining.
  if (
    preferredDepth > 0 &&
    leftNodes[preferredDepth - 1].type.spec.defining &&
    $from.node(preferredTargetIndex).type != leftNodes[preferredDepth - 1].type
  ) {
    preferredDepth -= 1;
  } else if (
    preferredDepth >= 2 &&
    leftNodes[preferredDepth - 1].isTextblock &&
    leftNodes[preferredDepth - 2].type.spec.defining &&
    $from.node(preferredTargetIndex).type != leftNodes[preferredDepth - 2].type
  ) {
    preferredDepth -= 2;
  }

  for (var j = slice.openStart; j >= 0; j--) {
    var openDepth = (j + preferredDepth + 1) % (slice.openStart + 1);
    var insert = leftNodes[openDepth];
    if (!insert) {
      continue;
    }
    for (var i$1 = 0; i$1 < targetDepths.length; i$1++) {
      // Loop over possible expansion levels, starting with the
      // preferred one
      var targetDepth =
          targetDepths[(i$1 + preferredTargetIndex) % targetDepths.length],
        expand = true;
      if (targetDepth < 0) {
        expand = false;
        targetDepth = -targetDepth;
      }
      var parent = $from.node(targetDepth - 1),
        index = $from.index(targetDepth - 1);
      if (parent.canReplaceWith(index, index, insert.type, insert.marks)) {
        return this.replace(
          $from.before(targetDepth),
          expand ? $to.after(targetDepth) : to,
          new Slice(
            closeFragment(slice.content, 0, slice.openStart, openDepth),
            openDepth,
            slice.openEnd,
          ),
        );
      }
    }
  }

  var startSteps = this.steps.length;
  for (var i$2 = targetDepths.length - 1; i$2 >= 0; i$2--) {
    this.replace(from, to, slice);
    if (this.steps.length > startSteps) {
      break;
    }
    var depth = targetDepths[i$2];
    if (depth < 0) {
      continue;
    }
    from = $from.before(depth);
    to = $to.after(depth);
  }
  return this;
};

function closeFragment(fragment, depth, oldOpen, newOpen, parent) {
  if (depth < oldOpen) {
    var first = fragment.firstChild;
    fragment = fragment.replaceChild(
      0,
      first.copy(
        closeFragment(first.content, depth + 1, oldOpen, newOpen, first),
      ),
    );
  }
  if (depth > newOpen) {
    var match = parent.contentMatchAt(0);
    var start = match.fillBefore(fragment).append(fragment);
    fragment = start.append(
      match.matchFragment(start).fillBefore(Fragment.empty, true),
    );
  }
  return fragment;
}

// :: (number, number, Node) → this
// Replace the given range with a node, but use `from` and `to` as
// hints, rather than precise positions. When from and to are the same
// and are at the start or end of a parent node in which the given
// node doesn't fit, this method may _move_ them out towards a parent
// that does allow the given node to be placed. When the given range
// completely covers a parent node, this method may completely replace
// that parent node.
Transform.prototype.replaceRangeWith = function (from, to, node) {
  if (
    !node.isInline &&
    from == to &&
    this.doc.resolve(from).parent.content.size
  ) {
    var point = insertPoint(this.doc, from, node.type);
    if (point != null) {
      from = to = point;
    }
  }
  return this.replaceRange(from, to, new Slice(Fragment.from(node), 0, 0));
};

// :: (number, number) → this
// Delete the given range, expanding it to cover fully covered
// parent nodes until a valid replace is found.
Transform.prototype.deleteRange = function (from, to) {
  var $from = this.doc.resolve(from),
    $to = this.doc.resolve(to);
  var covered = coveredDepths($from, $to);
  for (var i = 0; i < covered.length; i++) {
    var depth = covered[i],
      last = i == covered.length - 1;
    if ((last && depth == 0) || $from.node(depth).type.contentMatch.validEnd) {
      return this.delete($from.start(depth), $to.end(depth));
    }
    if (
      depth > 0 &&
      (last ||
        $from
          .node(depth - 1)
          .canReplace($from.index(depth - 1), $to.indexAfter(depth - 1)))
    ) {
      return this.delete($from.before(depth), $to.after(depth));
    }
  }
  for (var d = 1; d <= $from.depth && d <= $to.depth; d++) {
    if (
      from - $from.start(d) == $from.depth - d &&
      to > $from.end(d) &&
      $to.end(d) - to != $to.depth - d
    ) {
      return this.delete($from.before(d), to);
    }
  }
  return this.delete(from, to);
};

// : (ResolvedPos, ResolvedPos) → [number]
// Returns an array of all depths for which $from - $to spans the
// whole content of the nodes at that depth.
function coveredDepths($from, $to) {
  var result = [],
    minDepth = Math.min($from.depth, $to.depth);
  for (var d = minDepth; d >= 0; d--) {
    var start = $from.start(d);
    if (
      start < $from.pos - ($from.depth - d) ||
      $to.end(d) > $to.pos + ($to.depth - d) ||
      $from.node(d).type.spec.isolating ||
      $to.node(d).type.spec.isolating
    ) {
      break;
    }
    if (start == $to.start(d)) {
      result.push(d);
    }
  }
  return result;
}

var classesById = Object.create(null);

// ::- Superclass for editor selections. Every selection type should
// extend this. Should not be instantiated directly.
var Selection = function Selection($anchor, $head, ranges) {
  // :: [SelectionRange]
  // The ranges covered by the selection.
  this.ranges = ranges || [
    new SelectionRange($anchor.min($head), $anchor.max($head)),
  ];
  // :: ResolvedPos
  // The resolved anchor of the selection (the side that stays in
  // place when the selection is modified).
  this.$anchor = $anchor;
  // :: ResolvedPos
  // The resolved head of the selection (the side that moves when
  // the selection is modified).
  this.$head = $head;
};

var prototypeAccessors = {
  anchor: { configurable: true },
  head: { configurable: true },
  from: { configurable: true },
  to: { configurable: true },
  $from: { configurable: true },
  $to: { configurable: true },
  empty: { configurable: true },
};

// :: number
// The selection's anchor, as an unresolved position.
prototypeAccessors.anchor.get = function () {
  return this.$anchor.pos;
};

// :: number
// The selection's head.
prototypeAccessors.head.get = function () {
  return this.$head.pos;
};

// :: number
// The lower bound of the selection's main range.
prototypeAccessors.from.get = function () {
  return this.$from.pos;
};

// :: number
// The upper bound of the selection's main range.
prototypeAccessors.to.get = function () {
  return this.$to.pos;
};

// :: ResolvedPos
// The resolved lowerbound of the selection's main range.
prototypeAccessors.$from.get = function () {
  return this.ranges[0].$from;
};

// :: ResolvedPos
// The resolved upper bound of the selection's main range.
prototypeAccessors.$to.get = function () {
  return this.ranges[0].$to;
};

// :: bool
// Indicates whether the selection contains any content.
prototypeAccessors.empty.get = function () {
  var ranges = this.ranges;
  for (var i = 0; i < ranges.length; i++) {
    if (ranges[i].$from.pos != ranges[i].$to.pos) {
      return false;
    }
  }
  return true;
};

// eq:: (Selection) → bool
// Test whether the selection is the same as another selection.

// map:: (doc: Node, mapping: Mappable) → Selection
// Map this selection through a [mappable](#transform.Mappable) thing. `doc`
// should be the new document to which we are mapping.

// :: () → Slice
// Get the content of this selection as a slice.
Selection.prototype.content = function content() {
  return this.$from.node(0).slice(this.from, this.to, true);
};

// :: (Transaction, ?Slice)
// Replace the selection with a slice or, if no slice is given,
// delete the selection. Will append to the given transaction.
Selection.prototype.replace = function replace(tr, content) {
  if (content === void 0) content = Slice.empty;

  // Put the new selection at the position after the inserted
  // content. When that ended in an inline node, search backwards,
  // to get the position after that node. If not, search forward.
  var lastNode = content.content.lastChild,
    lastParent = null;
  for (var i = 0; i < content.openEnd; i++) {
    lastParent = lastNode;
    lastNode = lastNode.lastChild;
  }

  var mapFrom = tr.steps.length,
    ranges = this.ranges;
  for (var i$1 = 0; i$1 < ranges.length; i$1++) {
    var ref = ranges[i$1];
    var $from = ref.$from;
    var $to = ref.$to;
    var mapping = tr.mapping.slice(mapFrom);
    tr.replaceRange(
      mapping.map($from.pos),
      mapping.map($to.pos),
      i$1 ? Slice.empty : content,
    );
    if (i$1 == 0) {
      selectionToInsertionEnd(
        tr,
        mapFrom,
        (lastNode ? lastNode.isInline : lastParent && lastParent.isTextblock)
          ? -1
          : 1,
      );
    }
  }
};

// :: (Transaction, Node)
// Replace the selection with the given node, appending the changes
// to the given transaction.
Selection.prototype.replaceWith = function replaceWith(tr, node) {
  var mapFrom = tr.steps.length,
    ranges = this.ranges;
  for (var i = 0; i < ranges.length; i++) {
    var ref = ranges[i];
    var $from = ref.$from;
    var $to = ref.$to;
    var mapping = tr.mapping.slice(mapFrom);
    var from = mapping.map($from.pos),
      to = mapping.map($to.pos);
    if (i) {
      tr.deleteRange(from, to);
    } else {
      tr.replaceRangeWith(from, to, node);
      selectionToInsertionEnd(tr, mapFrom, node.isInline ? -1 : 1);
    }
  }
};

// toJSON:: () → Object
// Convert the selection to a JSON representation. When implementing
// this for a custom selection class, make sure to give the object a
// `type` property whose value matches the ID under which you
// [registered](#state.Selection^jsonID) your class.

// :: (ResolvedPos, number, ?bool) → ?Selection
// Find a valid cursor or leaf node selection starting at the given
// position and searching back if `dir` is negative, and forward if
// positive. When `textOnly` is true, only consider cursor
// selections. Will return null when no valid selection position is
// found.
Selection.findFrom = function findFrom($pos, dir, textOnly) {
  var inner = $pos.parent.inlineContent
    ? new TextSelection($pos)
    : findSelectionIn(
        $pos.node(0),
        $pos.parent,
        $pos.pos,
        $pos.index(),
        dir,
        textOnly,
      );
  if (inner) {
    return inner;
  }

  for (var depth = $pos.depth - 1; depth >= 0; depth--) {
    var found =
      dir < 0
        ? findSelectionIn(
            $pos.node(0),
            $pos.node(depth),
            $pos.before(depth + 1),
            $pos.index(depth),
            dir,
            textOnly,
          )
        : findSelectionIn(
            $pos.node(0),
            $pos.node(depth),
            $pos.after(depth + 1),
            $pos.index(depth) + 1,
            dir,
            textOnly,
          );
    if (found) {
      return found;
    }
  }
};

// :: (ResolvedPos, ?number) → Selection
// Find a valid cursor or leaf node selection near the given
// position. Searches forward first by default, but if `bias` is
// negative, it will search backwards first.
Selection.near = function near($pos, bias) {
  if (bias === void 0) bias = 1;

  return (
    this.findFrom($pos, bias) ||
    this.findFrom($pos, -bias) ||
    new AllSelection($pos.node(0))
  );
};

// :: (Node) → Selection
// Find the cursor or leaf node selection closest to the start of
// the given document. Will return an
// [`AllSelection`](#state.AllSelection) if no valid position
// exists.
Selection.atStart = function atStart(doc) {
  return findSelectionIn(doc, doc, 0, 0, 1) || new AllSelection(doc);
};

// :: (Node) → Selection
// Find the cursor or leaf node selection closest to the end of the
// given document.
Selection.atEnd = function atEnd(doc) {
  return (
    findSelectionIn(doc, doc, doc.content.size, doc.childCount, -1) ||
    new AllSelection(doc)
  );
};

// :: (Node, Object) → Selection
// Deserialize the JSON representation of a selection. Must be
// implemented for custom classes (as a static class method).
Selection.fromJSON = function fromJSON(doc, json) {
  if (!json || !json.type) {
    throw new RangeError('Invalid input for Selection.fromJSON');
  }
  var cls = classesById[json.type];
  if (!cls) {
    throw new RangeError('No selection type ' + json.type + ' defined');
  }
  return cls.fromJSON(doc, json);
};

// :: (string, constructor<Selection>)
// To be able to deserialize selections from JSON, custom selection
// classes must register themselves with an ID string, so that they
// can be disambiguated. Try to pick something that's unlikely to
// clash with classes from other modules.
Selection.jsonID = function jsonID(id, selectionClass) {
  if (id in classesById) {
    throw new RangeError('Duplicate use of selection JSON ID ' + id);
  }
  classesById[id] = selectionClass;
  selectionClass.prototype.jsonID = id;
  return selectionClass;
};

// :: () → SelectionBookmark
// Get a [bookmark](#state.SelectionBookmark) for this selection,
// which is a value that can be mapped without having access to a
// current document, and later resolved to a real selection for a
// given document again. (This is used mostly by the history to
// track and restore old selections.) The default implementation of
// this method just converts the selection to a text selection and
// returns the bookmark for that.
Selection.prototype.getBookmark = function getBookmark() {
  return TextSelection.between(this.$anchor, this.$head).getBookmark();
};

Object.defineProperties(Selection.prototype, prototypeAccessors);

// :: bool
// Controls whether, when a selection of this type is active in the
// browser, the selected range should be visible to the user. Defaults
// to `true`.
Selection.prototype.visible = true;

// SelectionBookmark:: interface
// A lightweight, document-independent representation of a selection.
// You can define a custom bookmark type for a custom selection class
// to make the history handle it well.
//
//   map:: (mapping: Mapping) → SelectionBookmark
//   Map the bookmark through a set of changes.
//
//   resolve:: (doc: Node) → Selection
//   Resolve the bookmark to a real selection again. This may need to
//   do some error checking and may fall back to a default (usually
//   [`TextSelection.between`](#state.TextSelection^between)) if
//   mapping made the bookmark invalid.

// ::- Represents a selected range in a document.
var SelectionRange = function SelectionRange($from, $to) {
  // :: ResolvedPos
  // The lower bound of the range.
  this.$from = $from;
  // :: ResolvedPos
  // The upper bound of the range.
  this.$to = $to;
};

// ::- A text selection represents a classical editor selection, with
// a head (the moving side) and anchor (immobile side), both of which
// point into textblock nodes. It can be empty (a regular cursor
// position).
var TextSelection = /*@__PURE__*/ (function (Selection) {
  function TextSelection($anchor, $head) {
    if ($head === void 0) $head = $anchor;

    Selection.call(this, $anchor, $head);
  }

  if (Selection) TextSelection.__proto__ = Selection;
  TextSelection.prototype = Object.create(Selection && Selection.prototype);
  TextSelection.prototype.constructor = TextSelection;

  var prototypeAccessors$1 = { $cursor: { configurable: true } };

  // :: ?ResolvedPos
  // Returns a resolved position if this is a cursor selection (an
  // empty text selection), and null otherwise.
  prototypeAccessors$1.$cursor.get = function () {
    return this.$anchor.pos == this.$head.pos ? this.$head : null;
  };

  TextSelection.prototype.map = function map(doc, mapping) {
    var $head = doc.resolve(mapping.map(this.head));
    if (!$head.parent.inlineContent) {
      return Selection.near($head);
    }
    var $anchor = doc.resolve(mapping.map(this.anchor));
    return new TextSelection(
      $anchor.parent.inlineContent ? $anchor : $head,
      $head,
    );
  };

  TextSelection.prototype.replace = function replace(tr, content) {
    if (content === void 0) content = Slice.empty;

    Selection.prototype.replace.call(this, tr, content);
    if (content == Slice.empty) {
      var marks = this.$from.marksAcross(this.$to);
      if (marks) {
        tr.ensureMarks(marks);
      }
    }
  };

  TextSelection.prototype.eq = function eq(other) {
    return (
      other instanceof TextSelection &&
      other.anchor == this.anchor &&
      other.head == this.head
    );
  };

  TextSelection.prototype.getBookmark = function getBookmark() {
    return new TextBookmark(this.anchor, this.head);
  };

  TextSelection.prototype.toJSON = function toJSON() {
    return { type: 'text', anchor: this.anchor, head: this.head };
  };

  TextSelection.fromJSON = function fromJSON(doc, json) {
    if (typeof json.anchor != 'number' || typeof json.head != 'number') {
      throw new RangeError('Invalid input for TextSelection.fromJSON');
    }
    return new TextSelection(doc.resolve(json.anchor), doc.resolve(json.head));
  };

  // :: (Node, number, ?number) → TextSelection
  // Create a text selection from non-resolved positions.
  TextSelection.create = function create(doc, anchor, head) {
    if (head === void 0) head = anchor;

    var $anchor = doc.resolve(anchor);
    return new this($anchor, head == anchor ? $anchor : doc.resolve(head));
  };

  // :: (ResolvedPos, ResolvedPos, ?number) → Selection
  // Return a text selection that spans the given positions or, if
  // they aren't text positions, find a text selection near them.
  // `bias` determines whether the method searches forward (default)
  // or backwards (negative number) first. Will fall back to calling
  // [`Selection.near`](#state.Selection^near) when the document
  // doesn't contain a valid text position.
  TextSelection.between = function between($anchor, $head, bias) {
    var dPos = $anchor.pos - $head.pos;
    if (!bias || dPos) {
      bias = dPos >= 0 ? 1 : -1;
    }
    if (!$head.parent.inlineContent) {
      var found =
        Selection.findFrom($head, bias, true) ||
        Selection.findFrom($head, -bias, true);
      if (found) {
        $head = found.$head;
      } else {
        return Selection.near($head, bias);
      }
    }
    if (!$anchor.parent.inlineContent) {
      if (dPos == 0) {
        $anchor = $head;
      } else {
        $anchor = (
          Selection.findFrom($anchor, -bias, true) ||
          Selection.findFrom($anchor, bias, true)
        ).$anchor;
        if ($anchor.pos < $head.pos != dPos < 0) {
          $anchor = $head;
        }
      }
    }
    return new TextSelection($anchor, $head);
  };

  Object.defineProperties(TextSelection.prototype, prototypeAccessors$1);

  return TextSelection;
})(Selection);

Selection.jsonID('text', TextSelection);

var TextBookmark = function TextBookmark(anchor, head) {
  this.anchor = anchor;
  this.head = head;
};
TextBookmark.prototype.map = function map(mapping) {
  return new TextBookmark(mapping.map(this.anchor), mapping.map(this.head));
};
TextBookmark.prototype.resolve = function resolve(doc) {
  return TextSelection.between(
    doc.resolve(this.anchor),
    doc.resolve(this.head),
  );
};

// ::- A node selection is a selection that points at a single node.
// All nodes marked [selectable](#model.NodeSpec.selectable) can be
// the target of a node selection. In such a selection, `from` and
// `to` point directly before and after the selected node, `anchor`
// equals `from`, and `head` equals `to`..
var NodeSelection = /*@__PURE__*/ (function (Selection) {
  function NodeSelection($pos) {
    var node = $pos.nodeAfter;
    var $end = $pos.node(0).resolve($pos.pos + node.nodeSize);
    Selection.call(this, $pos, $end);
    // :: Node The selected node.
    this.node = node;
  }

  if (Selection) NodeSelection.__proto__ = Selection;
  NodeSelection.prototype = Object.create(Selection && Selection.prototype);
  NodeSelection.prototype.constructor = NodeSelection;

  NodeSelection.prototype.map = function map(doc, mapping) {
    var ref = mapping.mapResult(this.anchor);
    var deleted = ref.deleted;
    var pos = ref.pos;
    var $pos = doc.resolve(pos);
    if (deleted) {
      return Selection.near($pos);
    }
    return new NodeSelection($pos);
  };

  NodeSelection.prototype.content = function content() {
    return new Slice(Fragment.from(this.node), 0, 0);
  };

  NodeSelection.prototype.eq = function eq(other) {
    return other instanceof NodeSelection && other.anchor == this.anchor;
  };

  NodeSelection.prototype.toJSON = function toJSON() {
    return { type: 'node', anchor: this.anchor };
  };

  NodeSelection.prototype.getBookmark = function getBookmark() {
    return new NodeBookmark(this.anchor);
  };

  NodeSelection.fromJSON = function fromJSON(doc, json) {
    if (typeof json.anchor != 'number') {
      throw new RangeError('Invalid input for NodeSelection.fromJSON');
    }
    return new NodeSelection(doc.resolve(json.anchor));
  };

  // :: (Node, number) → NodeSelection
  // Create a node selection from non-resolved positions.
  NodeSelection.create = function create(doc, from) {
    return new this(doc.resolve(from));
  };

  // :: (Node) → bool
  // Determines whether the given node may be selected as a node
  // selection.
  NodeSelection.isSelectable = function isSelectable(node) {
    return !node.isText && node.type.spec.selectable !== false;
  };

  return NodeSelection;
})(Selection);

NodeSelection.prototype.visible = false;

Selection.jsonID('node', NodeSelection);

var NodeBookmark = function NodeBookmark(anchor) {
  this.anchor = anchor;
};
NodeBookmark.prototype.map = function map(mapping) {
  var ref = mapping.mapResult(this.anchor);
  var deleted = ref.deleted;
  var pos = ref.pos;
  return deleted ? new TextBookmark(pos, pos) : new NodeBookmark(pos);
};
NodeBookmark.prototype.resolve = function resolve(doc) {
  var $pos = doc.resolve(this.anchor),
    node = $pos.nodeAfter;
  if (node && NodeSelection.isSelectable(node)) {
    return new NodeSelection($pos);
  }
  return Selection.near($pos);
};

// ::- A selection type that represents selecting the whole document
// (which can not necessarily be expressed with a text selection, when
// there are for example leaf block nodes at the start or end of the
// document).
var AllSelection = /*@__PURE__*/ (function (Selection) {
  function AllSelection(doc) {
    Selection.call(this, doc.resolve(0), doc.resolve(doc.content.size));
  }

  if (Selection) AllSelection.__proto__ = Selection;
  AllSelection.prototype = Object.create(Selection && Selection.prototype);
  AllSelection.prototype.constructor = AllSelection;

  AllSelection.prototype.replace = function replace(tr, content) {
    if (content === void 0) content = Slice.empty;

    if (content == Slice.empty) {
      tr.delete(0, tr.doc.content.size);
      var sel = Selection.atStart(tr.doc);
      if (!sel.eq(tr.selection)) {
        tr.setSelection(sel);
      }
    } else {
      Selection.prototype.replace.call(this, tr, content);
    }
  };

  AllSelection.prototype.toJSON = function toJSON() {
    return { type: 'all' };
  };

  AllSelection.fromJSON = function fromJSON(doc) {
    return new AllSelection(doc);
  };

  AllSelection.prototype.map = function map(doc) {
    return new AllSelection(doc);
  };

  AllSelection.prototype.eq = function eq(other) {
    return other instanceof AllSelection;
  };

  AllSelection.prototype.getBookmark = function getBookmark() {
    return AllBookmark;
  };

  return AllSelection;
})(Selection);

Selection.jsonID('all', AllSelection);

var AllBookmark = {
  map: function map() {
    return this;
  },
  resolve: function resolve(doc) {
    return new AllSelection(doc);
  },
};

// FIXME we'll need some awareness of text direction when scanning for selections

// Try to find a selection inside the given node. `pos` points at the
// position where the search starts. When `text` is true, only return
// text selections.
function findSelectionIn(doc, node, pos, index, dir, text) {
  if (node.inlineContent) {
    return TextSelection.create(doc, pos);
  }
  for (
    var i = index - (dir > 0 ? 0 : 1);
    dir > 0 ? i < node.childCount : i >= 0;
    i += dir
  ) {
    var child = node.child(i);
    if (!child.isAtom) {
      var inner = findSelectionIn(
        doc,
        child,
        pos + dir,
        dir < 0 ? child.childCount : 0,
        dir,
        text,
      );
      if (inner) {
        return inner;
      }
    } else if (!text && NodeSelection.isSelectable(child)) {
      return NodeSelection.create(doc, pos - (dir < 0 ? child.nodeSize : 0));
    }
    pos += child.nodeSize * dir;
  }
}

function selectionToInsertionEnd(tr, startLen, bias) {
  var last = tr.steps.length - 1;
  if (last < startLen) {
    return;
  }
  var step = tr.steps[last];
  if (!(step instanceof ReplaceStep || step instanceof ReplaceAroundStep)) {
    return;
  }
  var map = tr.mapping.maps[last],
    end;
  map.forEach(function (_from, _to, _newFrom, newTo) {
    if (end == null) {
      end = newTo;
    }
  });
  tr.setSelection(Selection.near(tr.doc.resolve(end), bias));
}

var UPDATED_SEL = 1,
  UPDATED_MARKS = 2,
  UPDATED_SCROLL = 4;

// ::- An editor state transaction, which can be applied to a state to
// create an updated state. Use
// [`EditorState.tr`](#state.EditorState.tr) to create an instance.
//
// Transactions track changes to the document (they are a subclass of
// [`Transform`](#transform.Transform)), but also other state changes,
// like selection updates and adjustments of the set of [stored
// marks](#state.EditorState.storedMarks). In addition, you can store
// metadata properties in a transaction, which are extra pieces of
// information that client code or plugins can use to describe what a
// transacion represents, so that they can update their [own
// state](#state.StateField) accordingly.
//
// The [editor view](#view.EditorView) uses a few metadata properties:
// it will attach a property `"pointer"` with the value `true` to
// selection transactions directly caused by mouse or touch input, and
// a `"uiEvent"` property of that may be `"paste"`, `"cut"`, or `"drop"`.
var Transaction = /*@__PURE__*/ (function (Transform) {
  function Transaction(state) {
    Transform.call(this, state.doc);
    // :: number
    // The timestamp associated with this transaction, in the same
    // format as `Date.now()`.
    this.time = Date.now();
    this.curSelection = state.selection;
    // The step count for which the current selection is valid.
    this.curSelectionFor = 0;
    // :: ?[Mark]
    // The stored marks set by this transaction, if any.
    this.storedMarks = state.storedMarks;
    // Bitfield to track which aspects of the state were updated by
    // this transaction.
    this.updated = 0;
    // Object used to store metadata properties for the transaction.
    this.meta = Object.create(null);
  }

  if (Transform) Transaction.__proto__ = Transform;
  Transaction.prototype = Object.create(Transform && Transform.prototype);
  Transaction.prototype.constructor = Transaction;

  var prototypeAccessors = {
    selection: { configurable: true },
    selectionSet: { configurable: true },
    storedMarksSet: { configurable: true },
    isGeneric: { configurable: true },
    scrolledIntoView: { configurable: true },
  };

  // :: Selection
  // The transaction's current selection. This defaults to the editor
  // selection [mapped](#state.Selection.map) through the steps in the
  // transaction, but can be overwritten with
  // [`setSelection`](#state.Transaction.setSelection).
  prototypeAccessors.selection.get = function () {
    if (this.curSelectionFor < this.steps.length) {
      this.curSelection = this.curSelection.map(
        this.doc,
        this.mapping.slice(this.curSelectionFor),
      );
      this.curSelectionFor = this.steps.length;
    }
    return this.curSelection;
  };

  // :: (Selection) → Transaction
  // Update the transaction's current selection. Will determine the
  // selection that the editor gets when the transaction is applied.
  Transaction.prototype.setSelection = function setSelection(selection) {
    if (selection.$from.doc != this.doc) {
      throw new RangeError(
        'Selection passed to setSelection must point at the current document',
      );
    }
    this.curSelection = selection;
    this.curSelectionFor = this.steps.length;
    this.updated = (this.updated | UPDATED_SEL) & ~UPDATED_MARKS;
    this.storedMarks = null;
    return this;
  };

  // :: bool
  // Whether the selection was explicitly updated by this transaction.
  prototypeAccessors.selectionSet.get = function () {
    return (this.updated & UPDATED_SEL) > 0;
  };

  // :: (?[Mark]) → Transaction
  // Set the current stored marks.
  Transaction.prototype.setStoredMarks = function setStoredMarks(marks) {
    this.storedMarks = marks;
    this.updated |= UPDATED_MARKS;
    return this;
  };

  // :: ([Mark]) → Transaction
  // Make sure the current stored marks or, if that is null, the marks
  // at the selection, match the given set of marks. Does nothing if
  // this is already the case.
  Transaction.prototype.ensureMarks = function ensureMarks(marks) {
    if (
      !Mark.sameSet(this.storedMarks || this.selection.$from.marks(), marks)
    ) {
      this.setStoredMarks(marks);
    }
    return this;
  };

  // :: (Mark) → Transaction
  // Add a mark to the set of stored marks.
  Transaction.prototype.addStoredMark = function addStoredMark(mark) {
    return this.ensureMarks(
      mark.addToSet(this.storedMarks || this.selection.$head.marks()),
    );
  };

  // :: (union<Mark, MarkType>) → Transaction
  // Remove a mark or mark type from the set of stored marks.
  Transaction.prototype.removeStoredMark = function removeStoredMark(mark) {
    return this.ensureMarks(
      mark.removeFromSet(this.storedMarks || this.selection.$head.marks()),
    );
  };

  // :: bool
  // Whether the stored marks were explicitly set for this transaction.
  prototypeAccessors.storedMarksSet.get = function () {
    return (this.updated & UPDATED_MARKS) > 0;
  };

  Transaction.prototype.addStep = function addStep(step, doc) {
    Transform.prototype.addStep.call(this, step, doc);
    this.updated = this.updated & ~UPDATED_MARKS;
    this.storedMarks = null;
  };

  // :: (number) → Transaction
  // Update the timestamp for the transaction.
  Transaction.prototype.setTime = function setTime(time) {
    this.time = time;
    return this;
  };

  // :: (Slice) → Transaction
  // Replace the current selection with the given slice.
  Transaction.prototype.replaceSelection = function replaceSelection(slice) {
    this.selection.replace(this, slice);
    return this;
  };

  // :: (Node, ?bool) → Transaction
  // Replace the selection with the given node. When `inheritMarks` is
  // true and the content is inline, it inherits the marks from the
  // place where it is inserted.
  Transaction.prototype.replaceSelectionWith = function replaceSelectionWith(
    node,
    inheritMarks,
  ) {
    var selection = this.selection;
    if (inheritMarks !== false) {
      node = node.mark(
        this.storedMarks ||
          (selection.empty
            ? selection.$from.marks()
            : selection.$from.marksAcross(selection.$to) || Mark.none),
      );
    }
    selection.replaceWith(this, node);
    return this;
  };

  // :: () → Transaction
  // Delete the selection.
  Transaction.prototype.deleteSelection = function deleteSelection() {
    this.selection.replace(this);
    return this;
  };

  // :: (string, from: ?number, to: ?number) → Transaction
  // Replace the given range, or the selection if no range is given,
  // with a text node containing the given string.
  Transaction.prototype.insertText = function insertText(text, from, to) {
    if (to === void 0) to = from;

    var schema = this.doc.type.schema;
    if (from == null) {
      if (!text) {
        return this.deleteSelection();
      }
      return this.replaceSelectionWith(schema.text(text), true);
    } else {
      if (!text) {
        return this.deleteRange(from, to);
      }
      var marks = this.storedMarks;
      if (!marks) {
        var $from = this.doc.resolve(from);
        marks =
          to == from ? $from.marks() : $from.marksAcross(this.doc.resolve(to));
      }
      this.replaceRangeWith(from, to, schema.text(text, marks));
      if (!this.selection.empty) {
        this.setSelection(Selection.near(this.selection.$to));
      }
      return this;
    }
  };

  // :: (union<string, Plugin, PluginKey>, any) → Transaction
  // Store a metadata property in this transaction, keyed either by
  // name or by plugin.
  Transaction.prototype.setMeta = function setMeta(key, value) {
    this.meta[typeof key == 'string' ? key : key.key] = value;
    return this;
  };

  // :: (union<string, Plugin, PluginKey>) → any
  // Retrieve a metadata property for a given name or plugin.
  Transaction.prototype.getMeta = function getMeta(key) {
    return this.meta[typeof key == 'string' ? key : key.key];
  };

  // :: bool
  // Returns true if this transaction doesn't contain any metadata,
  // and can thus safely be extended.
  prototypeAccessors.isGeneric.get = function () {
    for (var _ in this.meta) {
      return false;
    }
    return true;
  };

  // :: () → Transaction
  // Indicate that the editor should scroll the selection into view
  // when updated to the state produced by this transaction.
  Transaction.prototype.scrollIntoView = function scrollIntoView() {
    this.updated |= UPDATED_SCROLL;
    return this;
  };

  prototypeAccessors.scrolledIntoView.get = function () {
    return (this.updated & UPDATED_SCROLL) > 0;
  };

  Object.defineProperties(Transaction.prototype, prototypeAccessors);

  return Transaction;
})(Transform);

function bind(f, self) {
  return !self || !f ? f : f.bind(self);
}

var FieldDesc = function FieldDesc(name, desc, self) {
  this.name = name;
  this.init = bind(desc.init, self);
  this.apply = bind(desc.apply, self);
};

var baseFields = [
  new FieldDesc('doc', {
    init: function init(config) {
      return config.doc || config.schema.topNodeType.createAndFill();
    },
    apply: function apply(tr) {
      return tr.doc;
    },
  }),

  new FieldDesc('selection', {
    init: function init(config, instance) {
      return config.selection || Selection.atStart(instance.doc);
    },
    apply: function apply(tr) {
      return tr.selection;
    },
  }),

  new FieldDesc('storedMarks', {
    init: function init(config) {
      return config.storedMarks || null;
    },
    apply: function apply(tr, _marks, _old, state) {
      return state.selection.$cursor ? tr.storedMarks : null;
    },
  }),

  new FieldDesc('scrollToSelection', {
    init: function init() {
      return 0;
    },
    apply: function apply(tr, prev) {
      return tr.scrolledIntoView ? prev + 1 : prev;
    },
  }),
];

// Object wrapping the part of a state object that stays the same
// across transactions. Stored in the state's `config` property.
var Configuration = function Configuration(schema, plugins) {
  var this$1 = this;

  this.schema = schema;
  this.fields = baseFields.concat();
  this.plugins = [];
  this.pluginsByKey = Object.create(null);
  if (plugins) {
    plugins.forEach(function (plugin) {
      if (this$1.pluginsByKey[plugin.key]) {
        throw new RangeError(
          'Adding different instances of a keyed plugin (' + plugin.key + ')',
        );
      }
      this$1.plugins.push(plugin);
      this$1.pluginsByKey[plugin.key] = plugin;
      if (plugin.spec.state) {
        this$1.fields.push(
          new FieldDesc(plugin.key, plugin.spec.state, plugin),
        );
      }
    });
  }
};

// ::- The state of a ProseMirror editor is represented by an object
// of this type. A state is a persistent data structure—it isn't
// updated, but rather a new state value is computed from an old one
// using the [`apply`](#state.EditorState.apply) method.
//
// A state holds a number of built-in fields, and plugins can
// [define](#state.PluginSpec.state) additional fields.
var EditorState = function EditorState(config) {
  this.config = config;
};

var prototypeAccessors$1 = {
  schema: { configurable: true },
  plugins: { configurable: true },
  tr: { configurable: true },
};

// doc:: Node
// The current document.

// selection:: Selection
// The selection.

// storedMarks:: ?[Mark]
// A set of marks to apply to the next input. Will be null when
// no explicit marks have been set.

// :: Schema
// The schema of the state's document.
prototypeAccessors$1.schema.get = function () {
  return this.config.schema;
};

// :: [Plugin]
// The plugins that are active in this state.
prototypeAccessors$1.plugins.get = function () {
  return this.config.plugins;
};

// :: (Transaction) → EditorState
// Apply the given transaction to produce a new state.
EditorState.prototype.apply = function apply(tr) {
  return this.applyTransaction(tr).state;
};

// : (Transaction) → bool
EditorState.prototype.filterTransaction = function filterTransaction(
  tr,
  ignore,
) {
  if (ignore === void 0) ignore = -1;

  for (var i = 0; i < this.config.plugins.length; i++) {
    if (i != ignore) {
      var plugin = this.config.plugins[i];
      if (
        plugin.spec.filterTransaction &&
        !plugin.spec.filterTransaction.call(plugin, tr, this)
      ) {
        return false;
      }
    }
  }
  return true;
};

// :: (Transaction) → {state: EditorState, transactions: [Transaction]}
// Verbose variant of [`apply`](#state.EditorState.apply) that
// returns the precise transactions that were applied (which might
// be influenced by the [transaction
// hooks](#state.PluginSpec.filterTransaction) of
// plugins) along with the new state.
EditorState.prototype.applyTransaction = function applyTransaction(rootTr) {
  if (!this.filterTransaction(rootTr)) {
    return { state: this, transactions: [] };
  }

  var trs = [rootTr],
    newState = this.applyInner(rootTr),
    seen = null;
  // This loop repeatedly gives plugins a chance to respond to
  // transactions as new transactions are added, making sure to only
  // pass the transactions the plugin did not see before.
  for (;;) {
    var haveNew = false;
    for (var i = 0; i < this.config.plugins.length; i++) {
      var plugin = this.config.plugins[i];
      if (plugin.spec.appendTransaction) {
        var n = seen ? seen[i].n : 0,
          oldState = seen ? seen[i].state : this;
        var tr =
          n < trs.length &&
          plugin.spec.appendTransaction.call(
            plugin,
            n ? trs.slice(n) : trs,
            oldState,
            newState,
          );
        if (tr && newState.filterTransaction(tr, i)) {
          tr.setMeta('appendedTransaction', rootTr);
          if (!seen) {
            seen = [];
            for (var j = 0; j < this.config.plugins.length; j++) {
              seen.push(
                j < i
                  ? { state: newState, n: trs.length }
                  : { state: this, n: 0 },
              );
            }
          }
          trs.push(tr);
          newState = newState.applyInner(tr);
          haveNew = true;
        }
        if (seen) {
          seen[i] = { state: newState, n: trs.length };
        }
      }
    }
    if (!haveNew) {
      return { state: newState, transactions: trs };
    }
  }
};

// : (Transaction) → EditorState
EditorState.prototype.applyInner = function applyInner(tr) {
  if (!tr.before.eq(this.doc)) {
    throw new RangeError('Applying a mismatched transaction');
  }
  var newInstance = new EditorState(this.config),
    fields = this.config.fields;
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    newInstance[field.name] = field.apply(
      tr,
      this[field.name],
      this,
      newInstance,
    );
  }
  for (var i$1 = 0; i$1 < applyListeners.length; i$1++) {
    applyListeners[i$1](this, tr, newInstance);
  }
  return newInstance;
};

// :: Transaction
// Start a [transaction](#state.Transaction) from this state.
prototypeAccessors$1.tr.get = function () {
  return new Transaction(this);
};

// :: (Object) → EditorState
// Create a new state.
//
// config::- Configuration options. Must contain `schema` or `doc` (or both).
//
//    schema:: ?Schema
//    The schema to use (only relevant if no `doc` is specified).
//
//    doc:: ?Node
//    The starting document.
//
//    selection:: ?Selection
//    A valid selection in the document.
//
//    storedMarks:: ?[Mark]
//    The initial set of [stored marks](#state.EditorState.storedMarks).
//
//    plugins:: ?[Plugin]
//    The plugins that should be active in this state.
EditorState.create = function create(config) {
  var $config = new Configuration(
    config.doc ? config.doc.type.schema : config.schema,
    config.plugins,
  );
  var instance = new EditorState($config);
  for (var i = 0; i < $config.fields.length; i++) {
    instance[$config.fields[i].name] = $config.fields[i].init(config, instance);
  }
  return instance;
};

// :: (Object) → EditorState
// Create a new state based on this one, but with an adjusted set of
// active plugins. State fields that exist in both sets of plugins
// are kept unchanged. Those that no longer exist are dropped, and
// those that are new are initialized using their
// [`init`](#state.StateField.init) method, passing in the new
// configuration object..
//
// config::- configuration options
//
//   plugins:: [Plugin]
//   New set of active plugins.
EditorState.prototype.reconfigure = function reconfigure(config) {
  var $config = new Configuration(this.schema, config.plugins);
  var fields = $config.fields,
    instance = new EditorState($config);
  for (var i = 0; i < fields.length; i++) {
    var name = fields[i].name;
    instance[name] = this.hasOwnProperty(name)
      ? this[name]
      : fields[i].init(config, instance);
  }
  return instance;
};

// :: (?union<Object<Plugin>, string, number>) → Object
// Serialize this state to JSON. If you want to serialize the state
// of plugins, pass an object mapping property names to use in the
// resulting JSON object to plugin objects. The argument may also be
// a string or number, in which case it is ignored, to support the
// way `JSON.stringify` calls `toString` methods.
EditorState.prototype.toJSON = function toJSON(pluginFields) {
  var result = { doc: this.doc.toJSON(), selection: this.selection.toJSON() };
  if (this.storedMarks) {
    result.storedMarks = this.storedMarks.map(function (m) {
      return m.toJSON();
    });
  }
  if (pluginFields && typeof pluginFields == 'object') {
    for (var prop in pluginFields) {
      if (prop == 'doc' || prop == 'selection') {
        throw new RangeError(
          'The JSON fields `doc` and `selection` are reserved',
        );
      }
      var plugin = pluginFields[prop],
        state = plugin.spec.state;
      if (state && state.toJSON) {
        result[prop] = state.toJSON.call(plugin, this[plugin.key]);
      }
    }
  }
  return result;
};

// :: (Object, Object, ?Object<Plugin>) → EditorState
// Deserialize a JSON representation of a state. `config` should
// have at least a `schema` field, and should contain array of
// plugins to initialize the state with. `pluginFields` can be used
// to deserialize the state of plugins, by associating plugin
// instances with the property names they use in the JSON object.
//
// config::- configuration options
//
//   schema:: Schema
//   The schema to use.
//
//   plugins:: ?[Plugin]
//   The set of active plugins.
EditorState.fromJSON = function fromJSON(config, json, pluginFields) {
  if (!json) {
    throw new RangeError('Invalid input for EditorState.fromJSON');
  }
  if (!config.schema) {
    throw new RangeError("Required config field 'schema' missing");
  }
  var $config = new Configuration(config.schema, config.plugins);
  var instance = new EditorState($config);
  $config.fields.forEach(function (field) {
    if (field.name == 'doc') {
      instance.doc = Node.fromJSON(config.schema, json.doc);
    } else if (field.name == 'selection') {
      instance.selection = Selection.fromJSON(instance.doc, json.selection);
    } else if (field.name == 'storedMarks') {
      if (json.storedMarks) {
        instance.storedMarks = json.storedMarks.map(config.schema.markFromJSON);
      }
    } else {
      if (pluginFields) {
        for (var prop in pluginFields) {
          var plugin = pluginFields[prop],
            state = plugin.spec.state;
          if (
            plugin.key == field.name &&
            state &&
            state.fromJSON &&
            Object.prototype.hasOwnProperty.call(json, prop)
          ) {
            // This field belongs to a plugin mapped to a JSON field, read it from there.
            instance[field.name] = state.fromJSON.call(
              plugin,
              config,
              json[prop],
              instance,
            );
            return;
          }
        }
      }
      instance[field.name] = field.init(config, instance);
    }
  });
  return instance;
};

// Kludge to allow the view to track mappings between different
// instances of a state.
//
// FIXME this is no longer needed as of prosemirror-view 1.9.0,
// though due to backwards-compat we should probably keep it around
// for a while (if only as a no-op)
EditorState.addApplyListener = function addApplyListener(f) {
  applyListeners.push(f);
};
EditorState.removeApplyListener = function removeApplyListener(f) {
  var found = applyListeners.indexOf(f);
  if (found > -1) {
    applyListeners.splice(found, 1);
  }
};

Object.defineProperties(EditorState.prototype, prototypeAccessors$1);

var applyListeners = [];

export {
  AllSelection as A,
  EditorState as E,
  NodeSelection as N,
  Selection as S,
  TextSelection as T,
  dropPoint as d,
};
