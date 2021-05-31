(() => {
  'use strict';
  function t(t) {
    this.content = t;
  }
  (t.prototype = {
    constructor: t,
    find: function (t) {
      for (var e = 0; e < this.content.length; e += 2)
        if (this.content[e] === t) return e;
      return -1;
    },
    get: function (t) {
      var e = this.find(t);
      return -1 == e ? void 0 : this.content[e + 1];
    },
    update: function (e, n, r) {
      var o = r && r != e ? this.remove(r) : this,
        i = o.find(e),
        s = o.content.slice();
      return (
        -1 == i ? s.push(r || e, n) : ((s[i + 1] = n), r && (s[i] = r)),
        new t(s)
      );
    },
    remove: function (e) {
      var n = this.find(e);
      if (-1 == n) return this;
      var r = this.content.slice();
      return r.splice(n, 2), new t(r);
    },
    addToStart: function (e, n) {
      return new t([e, n].concat(this.remove(e).content));
    },
    addToEnd: function (e, n) {
      var r = this.remove(e).content.slice();
      return r.push(e, n), new t(r);
    },
    addBefore: function (e, n, r) {
      var o = this.remove(n),
        i = o.content.slice(),
        s = o.find(e);
      return i.splice(-1 == s ? i.length : s, 0, n, r), new t(i);
    },
    forEach: function (t) {
      for (var e = 0; e < this.content.length; e += 2)
        t(this.content[e], this.content[e + 1]);
    },
    prepend: function (e) {
      return (e = t.from(e)).size
        ? new t(e.content.concat(this.subtract(e).content))
        : this;
    },
    append: function (e) {
      return (e = t.from(e)).size
        ? new t(this.subtract(e).content.concat(e.content))
        : this;
    },
    subtract: function (e) {
      var n = this;
      e = t.from(e);
      for (var r = 0; r < e.content.length; r += 2) n = n.remove(e.content[r]);
      return n;
    },
    get size() {
      return this.content.length >> 1;
    },
  }),
    (t.from = function (e) {
      if (e instanceof t) return e;
      var n = [];
      if (e) for (var r in e) n.push(r, e[r]);
      return new t(n);
    });
  const e = t;
  function n(t, e, r) {
    for (var o = 0; ; o++) {
      if (o == t.childCount || o == e.childCount)
        return t.childCount == e.childCount ? null : r;
      var i = t.child(o),
        s = e.child(o);
      if (i != s) {
        if (!i.sameMarkup(s)) return r;
        if (i.isText && i.text != s.text) {
          for (var a = 0; i.text[a] == s.text[a]; a++) r++;
          return r;
        }
        if (i.content.size || s.content.size) {
          var c = n(i.content, s.content, r + 1);
          if (null != c) return c;
        }
        r += i.nodeSize;
      } else r += i.nodeSize;
    }
  }
  function r(t, e, n, o) {
    for (var i = t.childCount, s = e.childCount; ; ) {
      if (0 == i || 0 == s) return i == s ? null : { a: n, b: o };
      var a = t.child(--i),
        c = e.child(--s),
        h = a.nodeSize;
      if (a != c) {
        if (!a.sameMarkup(c)) return { a: n, b: o };
        if (a.isText && a.text != c.text) {
          for (
            var p = 0, l = Math.min(a.text.length, c.text.length);
            p < l &&
            a.text[a.text.length - p - 1] == c.text[c.text.length - p - 1];

          )
            p++, n--, o--;
          return { a: n, b: o };
        }
        if (a.content.size || c.content.size) {
          var f = r(a.content, c.content, n - 1, o - 1);
          if (f) return f;
        }
        (n -= h), (o -= h);
      } else (n -= h), (o -= h);
    }
  }
  var o = function (t, e) {
      if (((this.content = t), (this.size = e || 0), null == e))
        for (var n = 0; n < t.length; n++) this.size += t[n].nodeSize;
    },
    i = {
      firstChild: { configurable: !0 },
      lastChild: { configurable: !0 },
      childCount: { configurable: !0 },
    };
  (o.prototype.nodesBetween = function (t, e, n, r, o) {
    void 0 === r && (r = 0);
    for (var i = 0, s = 0; s < e; i++) {
      var a = this.content[i],
        c = s + a.nodeSize;
      if (c > t && !1 !== n(a, r + s, o, i) && a.content.size) {
        var h = s + 1;
        a.nodesBetween(
          Math.max(0, t - h),
          Math.min(a.content.size, e - h),
          n,
          r + h,
        );
      }
      s = c;
    }
  }),
    (o.prototype.descendants = function (t) {
      this.nodesBetween(0, this.size, t);
    }),
    (o.prototype.textBetween = function (t, e, n, r) {
      var o = '',
        i = !0;
      return (
        this.nodesBetween(
          t,
          e,
          function (s, a) {
            s.isText
              ? ((o += s.text.slice(Math.max(t, a) - a, e - a)), (i = !n))
              : s.isLeaf && r
              ? ((o += r), (i = !n))
              : !i && s.isBlock && ((o += n), (i = !0));
          },
          0,
        ),
        o
      );
    }),
    (o.prototype.append = function (t) {
      if (!t.size) return this;
      if (!this.size) return t;
      var e = this.lastChild,
        n = t.firstChild,
        r = this.content.slice(),
        i = 0;
      for (
        e.isText &&
        e.sameMarkup(n) &&
        ((r[r.length - 1] = e.withText(e.text + n.text)), (i = 1));
        i < t.content.length;
        i++
      )
        r.push(t.content[i]);
      return new o(r, this.size + t.size);
    }),
    (o.prototype.cut = function (t, e) {
      if ((null == e && (e = this.size), 0 == t && e == this.size)) return this;
      var n = [],
        r = 0;
      if (e > t)
        for (var i = 0, s = 0; s < e; i++) {
          var a = this.content[i],
            c = s + a.nodeSize;
          c > t &&
            ((s < t || c > e) &&
              (a = a.isText
                ? a.cut(Math.max(0, t - s), Math.min(a.text.length, e - s))
                : a.cut(
                    Math.max(0, t - s - 1),
                    Math.min(a.content.size, e - s - 1),
                  )),
            n.push(a),
            (r += a.nodeSize)),
            (s = c);
        }
      return new o(n, r);
    }),
    (o.prototype.cutByIndex = function (t, e) {
      return t == e
        ? o.empty
        : 0 == t && e == this.content.length
        ? this
        : new o(this.content.slice(t, e));
    }),
    (o.prototype.replaceChild = function (t, e) {
      var n = this.content[t];
      if (n == e) return this;
      var r = this.content.slice(),
        i = this.size + e.nodeSize - n.nodeSize;
      return (r[t] = e), new o(r, i);
    }),
    (o.prototype.addToStart = function (t) {
      return new o([t].concat(this.content), this.size + t.nodeSize);
    }),
    (o.prototype.addToEnd = function (t) {
      return new o(this.content.concat(t), this.size + t.nodeSize);
    }),
    (o.prototype.eq = function (t) {
      if (this.content.length != t.content.length) return !1;
      for (var e = 0; e < this.content.length; e++)
        if (!this.content[e].eq(t.content[e])) return !1;
      return !0;
    }),
    (i.firstChild.get = function () {
      return this.content.length ? this.content[0] : null;
    }),
    (i.lastChild.get = function () {
      return this.content.length ? this.content[this.content.length - 1] : null;
    }),
    (i.childCount.get = function () {
      return this.content.length;
    }),
    (o.prototype.child = function (t) {
      var e = this.content[t];
      if (!e) throw new RangeError('Index ' + t + ' out of range for ' + this);
      return e;
    }),
    (o.prototype.maybeChild = function (t) {
      return this.content[t];
    }),
    (o.prototype.forEach = function (t) {
      for (var e = 0, n = 0; e < this.content.length; e++) {
        var r = this.content[e];
        t(r, n, e), (n += r.nodeSize);
      }
    }),
    (o.prototype.findDiffStart = function (t, e) {
      return void 0 === e && (e = 0), n(this, t, e);
    }),
    (o.prototype.findDiffEnd = function (t, e, n) {
      return (
        void 0 === e && (e = this.size),
        void 0 === n && (n = t.size),
        r(this, t, e, n)
      );
    }),
    (o.prototype.findIndex = function (t, e) {
      if ((void 0 === e && (e = -1), 0 == t)) return a(0, t);
      if (t == this.size) return a(this.content.length, t);
      if (t > this.size || t < 0)
        throw new RangeError(
          'Position ' + t + ' outside of fragment (' + this + ')',
        );
      for (var n = 0, r = 0; ; n++) {
        var o = r + this.child(n).nodeSize;
        if (o >= t) return o == t || e > 0 ? a(n + 1, o) : a(n, r);
        r = o;
      }
    }),
    (o.prototype.toString = function () {
      return '<' + this.toStringInner() + '>';
    }),
    (o.prototype.toStringInner = function () {
      return this.content.join(', ');
    }),
    (o.prototype.toJSON = function () {
      return this.content.length
        ? this.content.map(function (t) {
            return t.toJSON();
          })
        : null;
    }),
    (o.fromJSON = function (t, e) {
      if (!e) return o.empty;
      if (!Array.isArray(e))
        throw new RangeError('Invalid input for Fragment.fromJSON');
      return new o(e.map(t.nodeFromJSON));
    }),
    (o.fromArray = function (t) {
      if (!t.length) return o.empty;
      for (var e, n = 0, r = 0; r < t.length; r++) {
        var i = t[r];
        (n += i.nodeSize),
          r && i.isText && t[r - 1].sameMarkup(i)
            ? (e || (e = t.slice(0, r)),
              (e[e.length - 1] = i.withText(e[e.length - 1].text + i.text)))
            : e && e.push(i);
      }
      return new o(e || t, n);
    }),
    (o.from = function (t) {
      if (!t) return o.empty;
      if (t instanceof o) return t;
      if (Array.isArray(t)) return this.fromArray(t);
      if (t.attrs) return new o([t], t.nodeSize);
      throw new RangeError(
        'Can not convert ' +
          t +
          ' to a Fragment' +
          (t.nodesBetween
            ? ' (looks like multiple versions of prosemirror-model were loaded)'
            : ''),
      );
    }),
    Object.defineProperties(o.prototype, i);
  var s = { index: 0, offset: 0 };
  function a(t, e) {
    return (s.index = t), (s.offset = e), s;
  }
  function c(t, e) {
    if (t === e) return !0;
    if (!t || 'object' != typeof t || !e || 'object' != typeof e) return !1;
    var n = Array.isArray(t);
    if (Array.isArray(e) != n) return !1;
    if (n) {
      if (t.length != e.length) return !1;
      for (var r = 0; r < t.length; r++) if (!c(t[r], e[r])) return !1;
    } else {
      for (var o in t) if (!(o in e) || !c(t[o], e[o])) return !1;
      for (var i in e) if (!(i in t)) return !1;
    }
    return !0;
  }
  o.empty = new o([], 0);
  var h = function (t, e) {
    (this.type = t), (this.attrs = e);
  };
  function p(t) {
    var e = Error.call(this, t);
    return (e.__proto__ = p.prototype), e;
  }
  (h.prototype.addToSet = function (t) {
    for (var e, n = !1, r = 0; r < t.length; r++) {
      var o = t[r];
      if (this.eq(o)) return t;
      if (this.type.excludes(o.type)) e || (e = t.slice(0, r));
      else {
        if (o.type.excludes(this.type)) return t;
        !n &&
          o.type.rank > this.type.rank &&
          (e || (e = t.slice(0, r)), e.push(this), (n = !0)),
          e && e.push(o);
      }
    }
    return e || (e = t.slice()), n || e.push(this), e;
  }),
    (h.prototype.removeFromSet = function (t) {
      for (var e = 0; e < t.length; e++)
        if (this.eq(t[e])) return t.slice(0, e).concat(t.slice(e + 1));
      return t;
    }),
    (h.prototype.isInSet = function (t) {
      for (var e = 0; e < t.length; e++) if (this.eq(t[e])) return !0;
      return !1;
    }),
    (h.prototype.eq = function (t) {
      return this == t || (this.type == t.type && c(this.attrs, t.attrs));
    }),
    (h.prototype.toJSON = function () {
      var t = { type: this.type.name };
      for (var e in this.attrs) {
        t.attrs = this.attrs;
        break;
      }
      return t;
    }),
    (h.fromJSON = function (t, e) {
      if (!e) throw new RangeError('Invalid input for Mark.fromJSON');
      var n = t.marks[e.type];
      if (!n)
        throw new RangeError(
          'There is no mark type ' + e.type + ' in this schema',
        );
      return n.create(e.attrs);
    }),
    (h.sameSet = function (t, e) {
      if (t == e) return !0;
      if (t.length != e.length) return !1;
      for (var n = 0; n < t.length; n++) if (!t[n].eq(e[n])) return !1;
      return !0;
    }),
    (h.setFrom = function (t) {
      if (!t || 0 == t.length) return h.none;
      if (t instanceof h) return [t];
      var e = t.slice();
      return (
        e.sort(function (t, e) {
          return t.type.rank - e.type.rank;
        }),
        e
      );
    }),
    (h.none = []),
    (p.prototype = Object.create(Error.prototype)),
    (p.prototype.constructor = p),
    (p.prototype.name = 'ReplaceError');
  var l = function (t, e, n) {
      (this.content = t), (this.openStart = e), (this.openEnd = n);
    },
    f = { size: { configurable: !0 } };
  function u(t, e, n) {
    var r = t.findIndex(e),
      o = r.index,
      i = r.offset,
      s = t.maybeChild(o),
      a = t.findIndex(n),
      c = a.index,
      h = a.offset;
    if (i == e || s.isText) {
      if (h != n && !t.child(c).isText)
        throw new RangeError('Removing non-flat range');
      return t.cut(0, e).append(t.cut(n));
    }
    if (o != c) throw new RangeError('Removing non-flat range');
    return t.replaceChild(o, s.copy(u(s.content, e - i - 1, n - i - 1)));
  }
  function d(t, e, n, r) {
    var o = t.findIndex(e),
      i = o.index,
      s = o.offset,
      a = t.maybeChild(i);
    if (s == e || a.isText)
      return r && !r.canReplace(i, i, n)
        ? null
        : t.cut(0, e).append(n).append(t.cut(e));
    var c = d(a.content, e - s - 1, n);
    return c && t.replaceChild(i, a.copy(c));
  }
  function m(t, e, n) {
    if (n.openStart > t.depth)
      throw new p('Inserted content deeper than insertion position');
    if (t.depth - n.openStart != e.depth - n.openEnd)
      throw new p('Inconsistent open depths');
    return v(t, e, n, 0);
  }
  function v(t, e, n, r) {
    var i = t.index(r),
      s = t.node(r);
    if (i == e.index(r) && r < t.depth - n.openStart) {
      var a = v(t, e, n, r + 1);
      return s.copy(s.content.replaceChild(i, a));
    }
    if (n.content.size) {
      if (n.openStart || n.openEnd || t.depth != r || e.depth != r) {
        var c = (function (t, e) {
          for (
            var n = e.depth - t.openStart,
              r = e.node(n).copy(t.content),
              i = n - 1;
            i >= 0;
            i--
          )
            r = e.node(i).copy(o.from(r));
          return {
            start: r.resolveNoCache(t.openStart + n),
            end: r.resolveNoCache(r.content.size - t.openEnd - n),
          };
        })(n, t);
        return k(s, S(t, c.start, c.end, e, r));
      }
      var h = t.parent,
        p = h.content;
      return k(
        h,
        p
          .cut(0, t.parentOffset)
          .append(n.content)
          .append(p.cut(e.parentOffset)),
      );
    }
    return k(s, x(t, e, r));
  }
  function g(t, e) {
    if (!e.type.compatibleContent(t.type))
      throw new p('Cannot join ' + e.type.name + ' onto ' + t.type.name);
  }
  function y(t, e, n) {
    var r = t.node(n);
    return g(r, e.node(n)), r;
  }
  function w(t, e) {
    var n = e.length - 1;
    n >= 0 && t.isText && t.sameMarkup(e[n])
      ? (e[n] = t.withText(e[n].text + t.text))
      : e.push(t);
  }
  function b(t, e, n, r) {
    var o = (e || t).node(n),
      i = 0,
      s = e ? e.index(n) : o.childCount;
    t &&
      ((i = t.index(n)),
      t.depth > n ? i++ : t.textOffset && (w(t.nodeAfter, r), i++));
    for (var a = i; a < s; a++) w(o.child(a), r);
    e && e.depth == n && e.textOffset && w(e.nodeBefore, r);
  }
  function k(t, e) {
    if (!t.type.validContent(e))
      throw new p('Invalid content for node ' + t.type.name);
    return t.copy(e);
  }
  function S(t, e, n, r, i) {
    var s = t.depth > i && y(t, e, i + 1),
      a = r.depth > i && y(n, r, i + 1),
      c = [];
    return (
      b(null, t, i, c),
      s && a && e.index(i) == n.index(i)
        ? (g(s, a), w(k(s, S(t, e, n, r, i + 1)), c))
        : (s && w(k(s, x(t, e, i + 1)), c),
          b(e, n, i, c),
          a && w(k(a, x(n, r, i + 1)), c)),
      b(r, null, i, c),
      new o(c)
    );
  }
  function x(t, e, n) {
    var r = [];
    return (
      b(null, t, n, r),
      t.depth > n && w(k(y(t, e, n + 1), x(t, e, n + 1)), r),
      b(e, null, n, r),
      new o(r)
    );
  }
  (f.size.get = function () {
    return this.content.size - this.openStart - this.openEnd;
  }),
    (l.prototype.insertAt = function (t, e) {
      var n = d(this.content, t + this.openStart, e, null);
      return n && new l(n, this.openStart, this.openEnd);
    }),
    (l.prototype.removeBetween = function (t, e) {
      return new l(
        u(this.content, t + this.openStart, e + this.openStart),
        this.openStart,
        this.openEnd,
      );
    }),
    (l.prototype.eq = function (t) {
      return (
        this.content.eq(t.content) &&
        this.openStart == t.openStart &&
        this.openEnd == t.openEnd
      );
    }),
    (l.prototype.toString = function () {
      return this.content + '(' + this.openStart + ',' + this.openEnd + ')';
    }),
    (l.prototype.toJSON = function () {
      if (!this.content.size) return null;
      var t = { content: this.content.toJSON() };
      return (
        this.openStart > 0 && (t.openStart = this.openStart),
        this.openEnd > 0 && (t.openEnd = this.openEnd),
        t
      );
    }),
    (l.fromJSON = function (t, e) {
      if (!e) return l.empty;
      var n = e.openStart || 0,
        r = e.openEnd || 0;
      if ('number' != typeof n || 'number' != typeof r)
        throw new RangeError('Invalid input for Slice.fromJSON');
      return new l(o.fromJSON(t, e.content), n, r);
    }),
    (l.maxOpen = function (t, e) {
      void 0 === e && (e = !0);
      for (
        var n = 0, r = 0, o = t.firstChild;
        o && !o.isLeaf && (e || !o.type.spec.isolating);
        o = o.firstChild
      )
        n++;
      for (
        var i = t.lastChild;
        i && !i.isLeaf && (e || !i.type.spec.isolating);
        i = i.lastChild
      )
        r++;
      return new l(t, n, r);
    }),
    Object.defineProperties(l.prototype, f),
    (l.empty = new l(o.empty, 0, 0));
  var O = function (t, e, n) {
      (this.pos = t),
        (this.path = e),
        (this.depth = e.length / 3 - 1),
        (this.parentOffset = n);
    },
    M = {
      parent: { configurable: !0 },
      doc: { configurable: !0 },
      textOffset: { configurable: !0 },
      nodeAfter: { configurable: !0 },
      nodeBefore: { configurable: !0 },
    };
  (O.prototype.resolveDepth = function (t) {
    return null == t ? this.depth : t < 0 ? this.depth + t : t;
  }),
    (M.parent.get = function () {
      return this.node(this.depth);
    }),
    (M.doc.get = function () {
      return this.node(0);
    }),
    (O.prototype.node = function (t) {
      return this.path[3 * this.resolveDepth(t)];
    }),
    (O.prototype.index = function (t) {
      return this.path[3 * this.resolveDepth(t) + 1];
    }),
    (O.prototype.indexAfter = function (t) {
      return (
        (t = this.resolveDepth(t)),
        this.index(t) + (t != this.depth || this.textOffset ? 1 : 0)
      );
    }),
    (O.prototype.start = function (t) {
      return 0 == (t = this.resolveDepth(t)) ? 0 : this.path[3 * t - 1] + 1;
    }),
    (O.prototype.end = function (t) {
      return (
        (t = this.resolveDepth(t)), this.start(t) + this.node(t).content.size
      );
    }),
    (O.prototype.before = function (t) {
      if (!(t = this.resolveDepth(t)))
        throw new RangeError('There is no position before the top-level node');
      return t == this.depth + 1 ? this.pos : this.path[3 * t - 1];
    }),
    (O.prototype.after = function (t) {
      if (!(t = this.resolveDepth(t)))
        throw new RangeError('There is no position after the top-level node');
      return t == this.depth + 1
        ? this.pos
        : this.path[3 * t - 1] + this.path[3 * t].nodeSize;
    }),
    (M.textOffset.get = function () {
      return this.pos - this.path[this.path.length - 1];
    }),
    (M.nodeAfter.get = function () {
      var t = this.parent,
        e = this.index(this.depth);
      if (e == t.childCount) return null;
      var n = this.pos - this.path[this.path.length - 1],
        r = t.child(e);
      return n ? t.child(e).cut(n) : r;
    }),
    (M.nodeBefore.get = function () {
      var t = this.index(this.depth),
        e = this.pos - this.path[this.path.length - 1];
      return e
        ? this.parent.child(t).cut(0, e)
        : 0 == t
        ? null
        : this.parent.child(t - 1);
    }),
    (O.prototype.posAtIndex = function (t, e) {
      e = this.resolveDepth(e);
      for (
        var n = this.path[3 * e],
          r = 0 == e ? 0 : this.path[3 * e - 1] + 1,
          o = 0;
        o < t;
        o++
      )
        r += n.child(o).nodeSize;
      return r;
    }),
    (O.prototype.marks = function () {
      var t = this.parent,
        e = this.index();
      if (0 == t.content.size) return h.none;
      if (this.textOffset) return t.child(e).marks;
      var n = t.maybeChild(e - 1),
        r = t.maybeChild(e);
      if (!n) {
        var o = n;
        (n = r), (r = o);
      }
      for (var i = n.marks, s = 0; s < i.length; s++)
        !1 !== i[s].type.spec.inclusive ||
          (r && i[s].isInSet(r.marks)) ||
          (i = i[s--].removeFromSet(i));
      return i;
    }),
    (O.prototype.marksAcross = function (t) {
      var e = this.parent.maybeChild(this.index());
      if (!e || !e.isInline) return null;
      for (
        var n = e.marks, r = t.parent.maybeChild(t.index()), o = 0;
        o < n.length;
        o++
      )
        !1 !== n[o].type.spec.inclusive ||
          (r && n[o].isInSet(r.marks)) ||
          (n = n[o--].removeFromSet(n));
      return n;
    }),
    (O.prototype.sharedDepth = function (t) {
      for (var e = this.depth; e > 0; e--)
        if (this.start(e) <= t && this.end(e) >= t) return e;
      return 0;
    }),
    (O.prototype.blockRange = function (t, e) {
      if ((void 0 === t && (t = this), t.pos < this.pos))
        return t.blockRange(this);
      for (
        var n =
          this.depth - (this.parent.inlineContent || this.pos == t.pos ? 1 : 0);
        n >= 0;
        n--
      )
        if (t.pos <= this.end(n) && (!e || e(this.node(n))))
          return new T(this, t, n);
    }),
    (O.prototype.sameParent = function (t) {
      return this.pos - this.parentOffset == t.pos - t.parentOffset;
    }),
    (O.prototype.max = function (t) {
      return t.pos > this.pos ? t : this;
    }),
    (O.prototype.min = function (t) {
      return t.pos < this.pos ? t : this;
    }),
    (O.prototype.toString = function () {
      for (var t = '', e = 1; e <= this.depth; e++)
        t += (t ? '/' : '') + this.node(e).type.name + '_' + this.index(e - 1);
      return t + ':' + this.parentOffset;
    }),
    (O.resolve = function (t, e) {
      if (!(e >= 0 && e <= t.content.size))
        throw new RangeError('Position ' + e + ' out of range');
      for (var n = [], r = 0, o = e, i = t; ; ) {
        var s = i.content.findIndex(o),
          a = s.index,
          c = s.offset,
          h = o - c;
        if ((n.push(i, a, r + c), !h)) break;
        if ((i = i.child(a)).isText) break;
        (o = h - 1), (r += c + 1);
      }
      return new O(e, n, o);
    }),
    (O.resolveCached = function (t, e) {
      for (var n = 0; n < C.length; n++) {
        var r = C[n];
        if (r.pos == e && r.doc == t) return r;
      }
      var o = (C[N] = O.resolve(t, e));
      return (N = (N + 1) % D), o;
    }),
    Object.defineProperties(O.prototype, M);
  var C = [],
    N = 0,
    D = 12,
    T = function (t, e, n) {
      (this.$from = t), (this.$to = e), (this.depth = n);
    },
    E = {
      start: { configurable: !0 },
      end: { configurable: !0 },
      parent: { configurable: !0 },
      startIndex: { configurable: !0 },
      endIndex: { configurable: !0 },
    };
  (E.start.get = function () {
    return this.$from.before(this.depth + 1);
  }),
    (E.end.get = function () {
      return this.$to.after(this.depth + 1);
    }),
    (E.parent.get = function () {
      return this.$from.node(this.depth);
    }),
    (E.startIndex.get = function () {
      return this.$from.index(this.depth);
    }),
    (E.endIndex.get = function () {
      return this.$to.indexAfter(this.depth);
    }),
    Object.defineProperties(T.prototype, E);
  var A = Object.create(null),
    R = function (t, e, n, r) {
      (this.type = t),
        (this.attrs = e),
        (this.content = n || o.empty),
        (this.marks = r || h.none);
    },
    z = {
      nodeSize: { configurable: !0 },
      childCount: { configurable: !0 },
      textContent: { configurable: !0 },
      firstChild: { configurable: !0 },
      lastChild: { configurable: !0 },
      isBlock: { configurable: !0 },
      isTextblock: { configurable: !0 },
      inlineContent: { configurable: !0 },
      isInline: { configurable: !0 },
      isText: { configurable: !0 },
      isLeaf: { configurable: !0 },
      isAtom: { configurable: !0 },
    };
  (z.nodeSize.get = function () {
    return this.isLeaf ? 1 : 2 + this.content.size;
  }),
    (z.childCount.get = function () {
      return this.content.childCount;
    }),
    (R.prototype.child = function (t) {
      return this.content.child(t);
    }),
    (R.prototype.maybeChild = function (t) {
      return this.content.maybeChild(t);
    }),
    (R.prototype.forEach = function (t) {
      this.content.forEach(t);
    }),
    (R.prototype.nodesBetween = function (t, e, n, r) {
      void 0 === r && (r = 0), this.content.nodesBetween(t, e, n, r, this);
    }),
    (R.prototype.descendants = function (t) {
      this.nodesBetween(0, this.content.size, t);
    }),
    (z.textContent.get = function () {
      return this.textBetween(0, this.content.size, '');
    }),
    (R.prototype.textBetween = function (t, e, n, r) {
      return this.content.textBetween(t, e, n, r);
    }),
    (z.firstChild.get = function () {
      return this.content.firstChild;
    }),
    (z.lastChild.get = function () {
      return this.content.lastChild;
    }),
    (R.prototype.eq = function (t) {
      return this == t || (this.sameMarkup(t) && this.content.eq(t.content));
    }),
    (R.prototype.sameMarkup = function (t) {
      return this.hasMarkup(t.type, t.attrs, t.marks);
    }),
    (R.prototype.hasMarkup = function (t, e, n) {
      return (
        this.type == t &&
        c(this.attrs, e || t.defaultAttrs || A) &&
        h.sameSet(this.marks, n || h.none)
      );
    }),
    (R.prototype.copy = function (t) {
      return (
        void 0 === t && (t = null),
        t == this.content
          ? this
          : new this.constructor(this.type, this.attrs, t, this.marks)
      );
    }),
    (R.prototype.mark = function (t) {
      return t == this.marks
        ? this
        : new this.constructor(this.type, this.attrs, this.content, t);
    }),
    (R.prototype.cut = function (t, e) {
      return 0 == t && e == this.content.size
        ? this
        : this.copy(this.content.cut(t, e));
    }),
    (R.prototype.slice = function (t, e, n) {
      if (
        (void 0 === e && (e = this.content.size),
        void 0 === n && (n = !1),
        t == e)
      )
        return l.empty;
      var r = this.resolve(t),
        o = this.resolve(e),
        i = n ? 0 : r.sharedDepth(e),
        s = r.start(i),
        a = r.node(i).content.cut(r.pos - s, o.pos - s);
      return new l(a, r.depth - i, o.depth - i);
    }),
    (R.prototype.replace = function (t, e, n) {
      return m(this.resolve(t), this.resolve(e), n);
    }),
    (R.prototype.nodeAt = function (t) {
      for (var e = this; ; ) {
        var n = e.content.findIndex(t),
          r = n.index,
          o = n.offset;
        if (!(e = e.maybeChild(r))) return null;
        if (o == t || e.isText) return e;
        t -= o + 1;
      }
    }),
    (R.prototype.childAfter = function (t) {
      var e = this.content.findIndex(t),
        n = e.index,
        r = e.offset;
      return { node: this.content.maybeChild(n), index: n, offset: r };
    }),
    (R.prototype.childBefore = function (t) {
      if (0 == t) return { node: null, index: 0, offset: 0 };
      var e = this.content.findIndex(t),
        n = e.index,
        r = e.offset;
      if (r < t) return { node: this.content.child(n), index: n, offset: r };
      var o = this.content.child(n - 1);
      return { node: o, index: n - 1, offset: r - o.nodeSize };
    }),
    (R.prototype.resolve = function (t) {
      return O.resolveCached(this, t);
    }),
    (R.prototype.resolveNoCache = function (t) {
      return O.resolve(this, t);
    }),
    (R.prototype.rangeHasMark = function (t, e, n) {
      var r = !1;
      return (
        e > t &&
          this.nodesBetween(t, e, function (t) {
            return n.isInSet(t.marks) && (r = !0), !r;
          }),
        r
      );
    }),
    (z.isBlock.get = function () {
      return this.type.isBlock;
    }),
    (z.isTextblock.get = function () {
      return this.type.isTextblock;
    }),
    (z.inlineContent.get = function () {
      return this.type.inlineContent;
    }),
    (z.isInline.get = function () {
      return this.type.isInline;
    }),
    (z.isText.get = function () {
      return this.type.isText;
    }),
    (z.isLeaf.get = function () {
      return this.type.isLeaf;
    }),
    (z.isAtom.get = function () {
      return this.type.isAtom;
    }),
    (R.prototype.toString = function () {
      if (this.type.spec.toDebugString)
        return this.type.spec.toDebugString(this);
      var t = this.type.name;
      return (
        this.content.size && (t += '(' + this.content.toStringInner() + ')'),
        I(this.marks, t)
      );
    }),
    (R.prototype.contentMatchAt = function (t) {
      var e = this.type.contentMatch.matchFragment(this.content, 0, t);
      if (!e)
        throw new Error('Called contentMatchAt on a node with invalid content');
      return e;
    }),
    (R.prototype.canReplace = function (t, e, n, r, i) {
      void 0 === n && (n = o.empty),
        void 0 === r && (r = 0),
        void 0 === i && (i = n.childCount);
      var s = this.contentMatchAt(t).matchFragment(n, r, i),
        a = s && s.matchFragment(this.content, e);
      if (!a || !a.validEnd) return !1;
      for (var c = r; c < i; c++)
        if (!this.type.allowsMarks(n.child(c).marks)) return !1;
      return !0;
    }),
    (R.prototype.canReplaceWith = function (t, e, n, r) {
      if (r && !this.type.allowsMarks(r)) return !1;
      var o = this.contentMatchAt(t).matchType(n),
        i = o && o.matchFragment(this.content, e);
      return !!i && i.validEnd;
    }),
    (R.prototype.canAppend = function (t) {
      return t.content.size
        ? this.canReplace(this.childCount, this.childCount, t.content)
        : this.type.compatibleContent(t.type);
    }),
    (R.prototype.check = function () {
      if (!this.type.validContent(this.content))
        throw new RangeError(
          'Invalid content for node ' +
            this.type.name +
            ': ' +
            this.content.toString().slice(0, 50),
        );
      for (var t = h.none, e = 0; e < this.marks.length; e++)
        t = this.marks[e].addToSet(t);
      if (!h.sameSet(t, this.marks))
        throw new RangeError(
          'Invalid collection of marks for node ' +
            this.type.name +
            ': ' +
            this.marks.map(function (t) {
              return t.type.name;
            }),
        );
      this.content.forEach(function (t) {
        return t.check();
      });
    }),
    (R.prototype.toJSON = function () {
      var t = { type: this.type.name };
      for (var e in this.attrs) {
        t.attrs = this.attrs;
        break;
      }
      return (
        this.content.size && (t.content = this.content.toJSON()),
        this.marks.length &&
          (t.marks = this.marks.map(function (t) {
            return t.toJSON();
          })),
        t
      );
    }),
    (R.fromJSON = function (t, e) {
      if (!e) throw new RangeError('Invalid input for Node.fromJSON');
      var n = null;
      if (e.marks) {
        if (!Array.isArray(e.marks))
          throw new RangeError('Invalid mark data for Node.fromJSON');
        n = e.marks.map(t.markFromJSON);
      }
      if ('text' == e.type) {
        if ('string' != typeof e.text)
          throw new RangeError('Invalid text node in JSON');
        return t.text(e.text, n);
      }
      var r = o.fromJSON(t, e.content);
      return t.nodeType(e.type).create(e.attrs, r, n);
    }),
    Object.defineProperties(R.prototype, z);
  var P = (function (t) {
    function e(e, n, r, o) {
      if ((t.call(this, e, n, null, o), !r))
        throw new RangeError('Empty text nodes are not allowed');
      this.text = r;
    }
    t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e);
    var n = {
      textContent: { configurable: !0 },
      nodeSize: { configurable: !0 },
    };
    return (
      (e.prototype.toString = function () {
        return this.type.spec.toDebugString
          ? this.type.spec.toDebugString(this)
          : I(this.marks, JSON.stringify(this.text));
      }),
      (n.textContent.get = function () {
        return this.text;
      }),
      (e.prototype.textBetween = function (t, e) {
        return this.text.slice(t, e);
      }),
      (n.nodeSize.get = function () {
        return this.text.length;
      }),
      (e.prototype.mark = function (t) {
        return t == this.marks
          ? this
          : new e(this.type, this.attrs, this.text, t);
      }),
      (e.prototype.withText = function (t) {
        return t == this.text
          ? this
          : new e(this.type, this.attrs, t, this.marks);
      }),
      (e.prototype.cut = function (t, e) {
        return (
          void 0 === t && (t = 0),
          void 0 === e && (e = this.text.length),
          0 == t && e == this.text.length
            ? this
            : this.withText(this.text.slice(t, e))
        );
      }),
      (e.prototype.eq = function (t) {
        return this.sameMarkup(t) && this.text == t.text;
      }),
      (e.prototype.toJSON = function () {
        var e = t.prototype.toJSON.call(this);
        return (e.text = this.text), e;
      }),
      Object.defineProperties(e.prototype, n),
      e
    );
  })(R);
  function I(t, e) {
    for (var n = t.length - 1; n >= 0; n--) e = t[n].type.name + '(' + e + ')';
    return e;
  }
  var B = function (t) {
      (this.validEnd = t), (this.next = []), (this.wrapCache = []);
    },
    F = {
      inlineContent: { configurable: !0 },
      defaultType: { configurable: !0 },
      edgeCount: { configurable: !0 },
    };
  (B.parse = function (t, e) {
    var n = new V(t, e);
    if (null == n.next) return B.empty;
    var r = $(n);
    n.next && n.err('Unexpected trailing text');
    var o,
      i,
      s =
        ((o = (function (t) {
          var e = [[]];
          return (
            o(
              (function t(e, i) {
                if ('choice' == e.type)
                  return e.exprs.reduce(function (e, n) {
                    return e.concat(t(n, i));
                  }, []);
                if ('seq' == e.type)
                  for (var s = 0; ; s++) {
                    var a = t(e.exprs[s], i);
                    if (s == e.exprs.length - 1) return a;
                    o(a, (i = n()));
                  }
                else {
                  if ('star' == e.type) {
                    var c = n();
                    return r(i, c), o(t(e.expr, c), c), [r(c)];
                  }
                  if ('plus' == e.type) {
                    var h = n();
                    return o(t(e.expr, i), h), o(t(e.expr, h), h), [r(h)];
                  }
                  if ('opt' == e.type) return [r(i)].concat(t(e.expr, i));
                  if ('range' == e.type) {
                    for (var p = i, l = 0; l < e.min; l++) {
                      var f = n();
                      o(t(e.expr, p), f), (p = f);
                    }
                    if (-1 == e.max) o(t(e.expr, p), p);
                    else
                      for (var u = e.min; u < e.max; u++) {
                        var d = n();
                        r(p, d), o(t(e.expr, p), d), (p = d);
                      }
                    return [r(p)];
                  }
                  if ('name' == e.type) return [r(i, null, e.value)];
                }
              })(t, 0),
              n(),
            ),
            e
          );
          function n() {
            return e.push([]) - 1;
          }
          function r(t, n, r) {
            var o = { term: r, to: n };
            return e[t].push(o), o;
          }
          function o(t, e) {
            t.forEach(function (t) {
              return (t.to = e);
            });
          }
        })(r)),
        (i = Object.create(null)),
        (function t(e) {
          var n = [];
          e.forEach(function (t) {
            o[t].forEach(function (t) {
              var e = t.term,
                r = t.to;
              if (e) {
                var i = n.indexOf(e),
                  s = i > -1 && n[i + 1];
                K(o, r).forEach(function (t) {
                  s || n.push(e, (s = [])), -1 == s.indexOf(t) && s.push(t);
                });
              }
            });
          });
          for (
            var r = (i[e.join(',')] = new B(e.indexOf(o.length - 1) > -1)),
              s = 0;
            s < n.length;
            s += 2
          ) {
            var a = n[s + 1].sort(W);
            r.next.push(n[s], i[a.join(',')] || t(a));
          }
          return r;
        })(K(o, 0)));
    return (
      (function (t, e) {
        for (var n = 0, r = [t]; n < r.length; n++) {
          for (
            var o = r[n], i = !o.validEnd, s = [], a = 0;
            a < o.next.length;
            a += 2
          ) {
            var c = o.next[a],
              h = o.next[a + 1];
            s.push(c.name),
              !i || c.isText || c.hasRequiredAttrs() || (i = !1),
              -1 == r.indexOf(h) && r.push(h);
          }
          i &&
            e.err(
              'Only non-generatable nodes (' +
                s.join(', ') +
                ') in a required position (see https://prosemirror.net/docs/guide/#generatable)',
            );
        }
      })(s, n),
      s
    );
  }),
    (B.prototype.matchType = function (t) {
      for (var e = 0; e < this.next.length; e += 2)
        if (this.next[e] == t) return this.next[e + 1];
      return null;
    }),
    (B.prototype.matchFragment = function (t, e, n) {
      void 0 === e && (e = 0), void 0 === n && (n = t.childCount);
      for (var r = this, o = e; r && o < n; o++)
        r = r.matchType(t.child(o).type);
      return r;
    }),
    (F.inlineContent.get = function () {
      var t = this.next[0];
      return !!t && t.isInline;
    }),
    (F.defaultType.get = function () {
      for (var t = 0; t < this.next.length; t += 2) {
        var e = this.next[t];
        if (!e.isText && !e.hasRequiredAttrs()) return e;
      }
    }),
    (B.prototype.compatible = function (t) {
      for (var e = 0; e < this.next.length; e += 2)
        for (var n = 0; n < t.next.length; n += 2)
          if (this.next[e] == t.next[n]) return !0;
      return !1;
    }),
    (B.prototype.fillBefore = function (t, e, n) {
      void 0 === e && (e = !1), void 0 === n && (n = 0);
      var r = [this];
      return (function i(s, a) {
        var c = s.matchFragment(t, n);
        if (c && (!e || c.validEnd))
          return o.from(
            a.map(function (t) {
              return t.createAndFill();
            }),
          );
        for (var h = 0; h < s.next.length; h += 2) {
          var p = s.next[h],
            l = s.next[h + 1];
          if (!p.isText && !p.hasRequiredAttrs() && -1 == r.indexOf(l)) {
            r.push(l);
            var f = i(l, a.concat(p));
            if (f) return f;
          }
        }
      })(this, []);
    }),
    (B.prototype.findWrapping = function (t) {
      for (var e = 0; e < this.wrapCache.length; e += 2)
        if (this.wrapCache[e] == t) return this.wrapCache[e + 1];
      var n = this.computeWrapping(t);
      return this.wrapCache.push(t, n), n;
    }),
    (B.prototype.computeWrapping = function (t) {
      for (
        var e = Object.create(null),
          n = [{ match: this, type: null, via: null }];
        n.length;

      ) {
        var r = n.shift(),
          o = r.match;
        if (o.matchType(t)) {
          for (var i = [], s = r; s.type; s = s.via) i.push(s.type);
          return i.reverse();
        }
        for (var a = 0; a < o.next.length; a += 2) {
          var c = o.next[a];
          c.isLeaf ||
            c.hasRequiredAttrs() ||
            c.name in e ||
            (r.type && !o.next[a + 1].validEnd) ||
            (n.push({ match: c.contentMatch, type: c, via: r }),
            (e[c.name] = !0));
        }
      }
    }),
    (F.edgeCount.get = function () {
      return this.next.length >> 1;
    }),
    (B.prototype.edge = function (t) {
      var e = t << 1;
      if (e >= this.next.length)
        throw new RangeError(
          "There's no " + t + 'th edge in this content match',
        );
      return { type: this.next[e], next: this.next[e + 1] };
    }),
    (B.prototype.toString = function () {
      var t = [];
      return (
        (function e(n) {
          t.push(n);
          for (var r = 1; r < n.next.length; r += 2)
            -1 == t.indexOf(n.next[r]) && e(n.next[r]);
        })(this),
        t
          .map(function (e, n) {
            for (
              var r = n + (e.validEnd ? '*' : ' ') + ' ', o = 0;
              o < e.next.length;
              o += 2
            )
              r +=
                (o ? ', ' : '') +
                e.next[o].name +
                '->' +
                t.indexOf(e.next[o + 1]);
            return r;
          })
          .join('\n')
      );
    }),
    Object.defineProperties(B.prototype, F),
    (B.empty = new B(!0));
  var V = function (t, e) {
      (this.string = t),
        (this.nodeTypes = e),
        (this.inline = null),
        (this.pos = 0),
        (this.tokens = t.split(/\s*(?=\b|\W|$)/)),
        '' == this.tokens[this.tokens.length - 1] && this.tokens.pop(),
        '' == this.tokens[0] && this.tokens.shift();
    },
    _ = { next: { configurable: !0 } };
  function $(t) {
    var e = [];
    do {
      e.push(j(t));
    } while (t.eat('|'));
    return 1 == e.length ? e[0] : { type: 'choice', exprs: e };
  }
  function j(t) {
    var e = [];
    do {
      e.push(L(t));
    } while (t.next && ')' != t.next && '|' != t.next);
    return 1 == e.length ? e[0] : { type: 'seq', exprs: e };
  }
  function L(t) {
    for (
      var e = (function (t) {
        if (t.eat('(')) {
          var e = $(t);
          return t.eat(')') || t.err('Missing closing paren'), e;
        }
        if (!/\W/.test(t.next)) {
          var n = (function (t, e) {
            var n = t.nodeTypes,
              r = n[e];
            if (r) return [r];
            var o = [];
            for (var i in n) {
              var s = n[i];
              s.groups.indexOf(e) > -1 && o.push(s);
            }
            return (
              0 == o.length && t.err("No node type or group '" + e + "' found"),
              o
            );
          })(t, t.next).map(function (e) {
            return (
              null == t.inline
                ? (t.inline = e.isInline)
                : t.inline != e.isInline &&
                  t.err('Mixing inline and block content'),
              { type: 'name', value: e }
            );
          });
          return t.pos++, 1 == n.length ? n[0] : { type: 'choice', exprs: n };
        }
        t.err("Unexpected token '" + t.next + "'");
      })(t);
      ;

    )
      if (t.eat('+')) e = { type: 'plus', expr: e };
      else if (t.eat('*')) e = { type: 'star', expr: e };
      else if (t.eat('?')) e = { type: 'opt', expr: e };
      else {
        if (!t.eat('{')) break;
        e = q(t, e);
      }
    return e;
  }
  function J(t) {
    /\D/.test(t.next) && t.err("Expected number, got '" + t.next + "'");
    var e = Number(t.next);
    return t.pos++, e;
  }
  function q(t, e) {
    var n = J(t),
      r = n;
    return (
      t.eat(',') && (r = '}' != t.next ? J(t) : -1),
      t.eat('}') || t.err('Unclosed braced range'),
      { type: 'range', min: n, max: r, expr: e }
    );
  }
  function W(t, e) {
    return e - t;
  }
  function K(t, e) {
    var n = [];
    return (
      (function e(r) {
        var o = t[r];
        if (1 == o.length && !o[0].term) return e(o[0].to);
        n.push(r);
        for (var i = 0; i < o.length; i++) {
          var s = o[i],
            a = s.term,
            c = s.to;
          a || -1 != n.indexOf(c) || e(c);
        }
      })(e),
      n.sort(W)
    );
  }
  function H(t) {
    var e = Object.create(null);
    for (var n in t) {
      var r = t[n];
      if (!r.hasDefault) return null;
      e[n] = r.default;
    }
    return e;
  }
  function U(t, e) {
    var n = Object.create(null);
    for (var r in t) {
      var o = e && e[r];
      if (void 0 === o) {
        var i = t[r];
        if (!i.hasDefault)
          throw new RangeError('No value supplied for attribute ' + r);
        o = i.default;
      }
      n[r] = o;
    }
    return n;
  }
  function G(t) {
    var e = Object.create(null);
    if (t) for (var n in t) e[n] = new Q(t[n]);
    return e;
  }
  (_.next.get = function () {
    return this.tokens[this.pos];
  }),
    (V.prototype.eat = function (t) {
      return this.next == t && (this.pos++ || !0);
    }),
    (V.prototype.err = function (t) {
      throw new SyntaxError(
        t + " (in content expression '" + this.string + "')",
      );
    }),
    Object.defineProperties(V.prototype, _);
  var X = function (t, e, n) {
      (this.name = t),
        (this.schema = e),
        (this.spec = n),
        (this.groups = n.group ? n.group.split(' ') : []),
        (this.attrs = G(n.attrs)),
        (this.defaultAttrs = H(this.attrs)),
        (this.contentMatch = null),
        (this.markSet = null),
        (this.inlineContent = null),
        (this.isBlock = !(n.inline || 'text' == t)),
        (this.isText = 'text' == t);
    },
    Y = {
      isInline: { configurable: !0 },
      isTextblock: { configurable: !0 },
      isLeaf: { configurable: !0 },
      isAtom: { configurable: !0 },
    };
  (Y.isInline.get = function () {
    return !this.isBlock;
  }),
    (Y.isTextblock.get = function () {
      return this.isBlock && this.inlineContent;
    }),
    (Y.isLeaf.get = function () {
      return this.contentMatch == B.empty;
    }),
    (Y.isAtom.get = function () {
      return this.isLeaf || this.spec.atom;
    }),
    (X.prototype.hasRequiredAttrs = function () {
      for (var t in this.attrs) if (this.attrs[t].isRequired) return !0;
      return !1;
    }),
    (X.prototype.compatibleContent = function (t) {
      return this == t || this.contentMatch.compatible(t.contentMatch);
    }),
    (X.prototype.computeAttrs = function (t) {
      return !t && this.defaultAttrs ? this.defaultAttrs : U(this.attrs, t);
    }),
    (X.prototype.create = function (t, e, n) {
      if (this.isText)
        throw new Error("NodeType.create can't construct text nodes");
      return new R(this, this.computeAttrs(t), o.from(e), h.setFrom(n));
    }),
    (X.prototype.createChecked = function (t, e, n) {
      if (((e = o.from(e)), !this.validContent(e)))
        throw new RangeError('Invalid content for node ' + this.name);
      return new R(this, this.computeAttrs(t), e, h.setFrom(n));
    }),
    (X.prototype.createAndFill = function (t, e, n) {
      if (((t = this.computeAttrs(t)), (e = o.from(e)).size)) {
        var r = this.contentMatch.fillBefore(e);
        if (!r) return null;
        e = r.append(e);
      }
      var i = this.contentMatch.matchFragment(e).fillBefore(o.empty, !0);
      return i ? new R(this, t, e.append(i), h.setFrom(n)) : null;
    }),
    (X.prototype.validContent = function (t) {
      var e = this.contentMatch.matchFragment(t);
      if (!e || !e.validEnd) return !1;
      for (var n = 0; n < t.childCount; n++)
        if (!this.allowsMarks(t.child(n).marks)) return !1;
      return !0;
    }),
    (X.prototype.allowsMarkType = function (t) {
      return null == this.markSet || this.markSet.indexOf(t) > -1;
    }),
    (X.prototype.allowsMarks = function (t) {
      if (null == this.markSet) return !0;
      for (var e = 0; e < t.length; e++)
        if (!this.allowsMarkType(t[e].type)) return !1;
      return !0;
    }),
    (X.prototype.allowedMarks = function (t) {
      if (null == this.markSet) return t;
      for (var e, n = 0; n < t.length; n++)
        this.allowsMarkType(t[n].type)
          ? e && e.push(t[n])
          : e || (e = t.slice(0, n));
      return e ? (e.length ? e : h.empty) : t;
    }),
    (X.compile = function (t, e) {
      var n = Object.create(null);
      t.forEach(function (t, r) {
        return (n[t] = new X(t, e, r));
      });
      var r = e.spec.topNode || 'doc';
      if (!n[r])
        throw new RangeError(
          "Schema is missing its top node type ('" + r + "')",
        );
      if (!n.text) throw new RangeError("Every schema needs a 'text' type");
      for (var o in n.text.attrs)
        throw new RangeError('The text node type should not have attributes');
      return n;
    }),
    Object.defineProperties(X.prototype, Y);
  var Q = function (t) {
      (this.hasDefault = Object.prototype.hasOwnProperty.call(t, 'default')),
        (this.default = t.default);
    },
    Z = { isRequired: { configurable: !0 } };
  (Z.isRequired.get = function () {
    return !this.hasDefault;
  }),
    Object.defineProperties(Q.prototype, Z);
  var tt = function (t, e, n, r) {
    (this.name = t),
      (this.schema = n),
      (this.spec = r),
      (this.attrs = G(r.attrs)),
      (this.rank = e),
      (this.excluded = null);
    var o = H(this.attrs);
    this.instance = o && new h(this, o);
  };
  (tt.prototype.create = function (t) {
    return !t && this.instance ? this.instance : new h(this, U(this.attrs, t));
  }),
    (tt.compile = function (t, e) {
      var n = Object.create(null),
        r = 0;
      return (
        t.forEach(function (t, o) {
          return (n[t] = new tt(t, r++, e, o));
        }),
        n
      );
    }),
    (tt.prototype.removeFromSet = function (t) {
      for (var e = 0; e < t.length; e++)
        t[e].type == this && ((t = t.slice(0, e).concat(t.slice(e + 1))), e--);
      return t;
    }),
    (tt.prototype.isInSet = function (t) {
      for (var e = 0; e < t.length; e++) if (t[e].type == this) return t[e];
    }),
    (tt.prototype.excludes = function (t) {
      return this.excluded.indexOf(t) > -1;
    });
  var et = function (t) {
    for (var n in ((this.spec = {}), t)) this.spec[n] = t[n];
    (this.spec.nodes = e.from(t.nodes)),
      (this.spec.marks = e.from(t.marks)),
      (this.nodes = X.compile(this.spec.nodes, this)),
      (this.marks = tt.compile(this.spec.marks, this));
    var r = Object.create(null);
    for (var o in this.nodes) {
      if (o in this.marks)
        throw new RangeError(o + ' can not be both a node and a mark');
      var i = this.nodes[o],
        s = i.spec.content || '',
        a = i.spec.marks;
      (i.contentMatch = r[s] || (r[s] = B.parse(s, this.nodes))),
        (i.inlineContent = i.contentMatch.inlineContent),
        (i.markSet =
          '_' == a
            ? null
            : a
            ? nt(this, a.split(' '))
            : '' != a && i.inlineContent
            ? null
            : []);
    }
    for (var c in this.marks) {
      var h = this.marks[c],
        p = h.spec.excludes;
      h.excluded = null == p ? [h] : '' == p ? [] : nt(this, p.split(' '));
    }
    (this.nodeFromJSON = this.nodeFromJSON.bind(this)),
      (this.markFromJSON = this.markFromJSON.bind(this)),
      (this.topNodeType = this.nodes[this.spec.topNode || 'doc']),
      (this.cached = Object.create(null)),
      (this.cached.wrappings = Object.create(null));
  };
  function nt(t, e) {
    for (var n = [], r = 0; r < e.length; r++) {
      var o = e[r],
        i = t.marks[o],
        s = i;
      if (i) n.push(i);
      else
        for (var a in t.marks) {
          var c = t.marks[a];
          ('_' == o ||
            (c.spec.group && c.spec.group.split(' ').indexOf(o) > -1)) &&
            n.push((s = c));
        }
      if (!s) throw new SyntaxError("Unknown mark type: '" + e[r] + "'");
    }
    return n;
  }
  (et.prototype.node = function (t, e, n, r) {
    if ('string' == typeof t) t = this.nodeType(t);
    else {
      if (!(t instanceof X)) throw new RangeError('Invalid node type: ' + t);
      if (t.schema != this)
        throw new RangeError(
          'Node type from different schema used (' + t.name + ')',
        );
    }
    return t.createChecked(e, n, r);
  }),
    (et.prototype.text = function (t, e) {
      var n = this.nodes.text;
      return new P(n, n.defaultAttrs, t, h.setFrom(e));
    }),
    (et.prototype.mark = function (t, e) {
      return 'string' == typeof t && (t = this.marks[t]), t.create(e);
    }),
    (et.prototype.nodeFromJSON = function (t) {
      return R.fromJSON(this, t);
    }),
    (et.prototype.markFromJSON = function (t) {
      return h.fromJSON(this, t);
    }),
    (et.prototype.nodeType = function (t) {
      var e = this.nodes[t];
      if (!e) throw new RangeError('Unknown node type: ' + t);
      return e;
    });
  var rt = function (t, e) {
    var n = this;
    (this.schema = t),
      (this.rules = e),
      (this.tags = []),
      (this.styles = []),
      e.forEach(function (t) {
        t.tag ? n.tags.push(t) : t.style && n.styles.push(t);
      }),
      (this.normalizeLists = !this.tags.some(function (e) {
        if (!/^(ul|ol)\b/.test(e.tag) || !e.node) return !1;
        var n = t.nodes[e.node];
        return n.contentMatch.matchType(n);
      }));
  };
  (rt.prototype.parse = function (t, e) {
    void 0 === e && (e = {});
    var n = new ht(this, e, !1);
    return n.addAll(t, null, e.from, e.to), n.finish();
  }),
    (rt.prototype.parseSlice = function (t, e) {
      void 0 === e && (e = {});
      var n = new ht(this, e, !0);
      return n.addAll(t, null, e.from, e.to), l.maxOpen(n.finish());
    }),
    (rt.prototype.matchTag = function (t, e, n) {
      for (
        var r = n ? this.tags.indexOf(n) + 1 : 0;
        r < this.tags.length;
        r++
      ) {
        var o = this.tags[r];
        if (
          lt(t, o.tag) &&
          (void 0 === o.namespace || t.namespaceURI == o.namespace) &&
          (!o.context || e.matchesContext(o.context))
        ) {
          if (o.getAttrs) {
            var i = o.getAttrs(t);
            if (!1 === i) continue;
            o.attrs = i;
          }
          return o;
        }
      }
    }),
    (rt.prototype.matchStyle = function (t, e, n, r) {
      for (
        var o = r ? this.styles.indexOf(r) + 1 : 0;
        o < this.styles.length;
        o++
      ) {
        var i = this.styles[o];
        if (
          !(
            0 != i.style.indexOf(t) ||
            (i.context && !n.matchesContext(i.context)) ||
            (i.style.length > t.length &&
              (61 != i.style.charCodeAt(t.length) ||
                i.style.slice(t.length + 1) != e))
          )
        ) {
          if (i.getAttrs) {
            var s = i.getAttrs(e);
            if (!1 === s) continue;
            i.attrs = s;
          }
          return i;
        }
      }
    }),
    (rt.schemaRules = function (t) {
      var e = [];
      function n(t) {
        for (
          var n = null == t.priority ? 50 : t.priority, r = 0;
          r < e.length;
          r++
        ) {
          var o = e[r];
          if ((null == o.priority ? 50 : o.priority) < n) break;
        }
        e.splice(r, 0, t);
      }
      var r,
        o = function (e) {
          var r = t.marks[e].spec.parseDOM;
          r &&
            r.forEach(function (t) {
              n((t = ft(t))), (t.mark = e);
            });
        };
      for (var i in t.marks) o(i);
      for (var s in t.nodes)
        (r = void 0),
          (r = t.nodes[s].spec.parseDOM) &&
            r.forEach(function (t) {
              n((t = ft(t))), (t.node = s);
            });
      return e;
    }),
    (rt.fromSchema = function (t) {
      return (
        t.cached.domParser ||
        (t.cached.domParser = new rt(t, rt.schemaRules(t)))
      );
    });
  var ot = {
      address: !0,
      article: !0,
      aside: !0,
      blockquote: !0,
      canvas: !0,
      dd: !0,
      div: !0,
      dl: !0,
      fieldset: !0,
      figcaption: !0,
      figure: !0,
      footer: !0,
      form: !0,
      h1: !0,
      h2: !0,
      h3: !0,
      h4: !0,
      h5: !0,
      h6: !0,
      header: !0,
      hgroup: !0,
      hr: !0,
      li: !0,
      noscript: !0,
      ol: !0,
      output: !0,
      p: !0,
      pre: !0,
      section: !0,
      table: !0,
      tfoot: !0,
      ul: !0,
    },
    it = {
      head: !0,
      noscript: !0,
      object: !0,
      script: !0,
      style: !0,
      title: !0,
    },
    st = { ol: !0, ul: !0 };
  function at(t) {
    return (t ? 1 : 0) | ('full' === t ? 2 : 0);
  }
  var ct = function (t, e, n, r, o, i, s) {
    (this.type = t),
      (this.attrs = e),
      (this.solid = o),
      (this.match = i || (4 & s ? null : t.contentMatch)),
      (this.options = s),
      (this.content = []),
      (this.marks = n),
      (this.activeMarks = h.none),
      (this.pendingMarks = r),
      (this.stashMarks = []);
  };
  (ct.prototype.findWrapping = function (t) {
    if (!this.match) {
      if (!this.type) return [];
      var e = this.type.contentMatch.fillBefore(o.from(t));
      if (!e) {
        var n,
          r = this.type.contentMatch;
        return (n = r.findWrapping(t.type)) ? ((this.match = r), n) : null;
      }
      this.match = this.type.contentMatch.matchFragment(e);
    }
    return this.match.findWrapping(t.type);
  }),
    (ct.prototype.finish = function (t) {
      if (!(1 & this.options)) {
        var e,
          n = this.content[this.content.length - 1];
        n &&
          n.isText &&
          (e = /[ \t\r\n\u000c]+$/.exec(n.text)) &&
          (n.text.length == e[0].length
            ? this.content.pop()
            : (this.content[this.content.length - 1] = n.withText(
                n.text.slice(0, n.text.length - e[0].length),
              )));
      }
      var r = o.from(this.content);
      return (
        !t && this.match && (r = r.append(this.match.fillBefore(o.empty, !0))),
        this.type ? this.type.create(this.attrs, r, this.marks) : r
      );
    }),
    (ct.prototype.popFromStashMark = function (t) {
      for (var e = this.stashMarks.length - 1; e >= 0; e--)
        if (t.eq(this.stashMarks[e])) return this.stashMarks.splice(e, 1)[0];
    }),
    (ct.prototype.applyPending = function (t) {
      for (var e = 0, n = this.pendingMarks; e < n.length; e++) {
        var r = n[e];
        (this.type ? this.type.allowsMarkType(r.type) : ut(r.type, t)) &&
          !r.isInSet(this.activeMarks) &&
          ((this.activeMarks = r.addToSet(this.activeMarks)),
          (this.pendingMarks = r.removeFromSet(this.pendingMarks)));
      }
    });
  var ht = function (t, e, n) {
      (this.parser = t), (this.options = e), (this.isOpen = n);
      var r,
        o = e.topNode,
        i = at(e.preserveWhitespace) | (n ? 4 : 0);
      (r = o
        ? new ct(
            o.type,
            o.attrs,
            h.none,
            h.none,
            !0,
            e.topMatch || o.type.contentMatch,
            i,
          )
        : new ct(
            n ? null : t.schema.topNodeType,
            null,
            h.none,
            h.none,
            !0,
            null,
            i,
          )),
        (this.nodes = [r]),
        (this.open = 0),
        (this.find = e.findPositions),
        (this.needsBlock = !1);
    },
    pt = { top: { configurable: !0 }, currentPos: { configurable: !0 } };
  function lt(t, e) {
    return (
      t.matches ||
      t.msMatchesSelector ||
      t.webkitMatchesSelector ||
      t.mozMatchesSelector
    ).call(t, e);
  }
  function ft(t) {
    var e = {};
    for (var n in t) e[n] = t[n];
    return e;
  }
  function ut(t, e) {
    var n = e.schema.nodes,
      r = function (r) {
        var o = n[r];
        if (o.allowsMarkType(t)) {
          var i = [],
            s = function (t) {
              i.push(t);
              for (var n = 0; n < t.edgeCount; n++) {
                var r = t.edge(n),
                  o = r.type,
                  a = r.next;
                if (o == e) return !0;
                if (i.indexOf(a) < 0 && s(a)) return !0;
              }
            };
          return s(o.contentMatch) ? { v: !0 } : void 0;
        }
      };
    for (var o in n) {
      var i = r(o);
      if (i) return i.v;
    }
  }
  (pt.top.get = function () {
    return this.nodes[this.open];
  }),
    (ht.prototype.addDOM = function (t) {
      if (3 == t.nodeType) this.addTextNode(t);
      else if (1 == t.nodeType) {
        var e = t.getAttribute('style'),
          n = e
            ? this.readStyles(
                (function (t) {
                  for (
                    var e, n = /\s*([\w-]+)\s*:\s*([^;]+)/g, r = [];
                    (e = n.exec(t));

                  )
                    r.push(e[1], e[2].trim());
                  return r;
                })(e),
              )
            : null,
          r = this.top;
        if (null != n)
          for (var o = 0; o < n.length; o++) this.addPendingMark(n[o]);
        if ((this.addElement(t), null != n))
          for (var i = 0; i < n.length; i++) this.removePendingMark(n[i], r);
      }
    }),
    (ht.prototype.addTextNode = function (t) {
      var e = t.nodeValue,
        n = this.top;
      if (
        2 & n.options ||
        (n.type
          ? n.type.inlineContent
          : n.content.length && n.content[0].isInline) ||
        /[^ \t\r\n\u000c]/.test(e)
      ) {
        if (1 & n.options)
          e =
            2 & n.options
              ? e.replace(/\r\n?/g, '\n')
              : e.replace(/\r?\n|\r/g, ' ');
        else if (
          ((e = e.replace(/[ \t\r\n\u000c]+/g, ' ')),
          /^[ \t\r\n\u000c]/.test(e) && this.open == this.nodes.length - 1)
        ) {
          var r = n.content[n.content.length - 1],
            o = t.previousSibling;
          (!r ||
            (o && 'BR' == o.nodeName) ||
            (r.isText && /[ \t\r\n\u000c]$/.test(r.text))) &&
            (e = e.slice(1));
        }
        e && this.insertNode(this.parser.schema.text(e)), this.findInText(t);
      } else this.findInside(t);
    }),
    (ht.prototype.addElement = function (t, e) {
      var n,
        r = t.nodeName.toLowerCase();
      st.hasOwnProperty(r) &&
        this.parser.normalizeLists &&
        (function (t) {
          for (var e = t.firstChild, n = null; e; e = e.nextSibling) {
            var r = 1 == e.nodeType ? e.nodeName.toLowerCase() : null;
            r && st.hasOwnProperty(r) && n
              ? (n.appendChild(e), (e = n))
              : 'li' == r
              ? (n = e)
              : r && (n = null);
          }
        })(t);
      var o =
        (this.options.ruleFromNode && this.options.ruleFromNode(t)) ||
        (n = this.parser.matchTag(t, this, e));
      if (o ? o.ignore : it.hasOwnProperty(r))
        this.findInside(t), this.ignoreFallback(t);
      else if (!o || o.skip || o.closeParent) {
        o && o.closeParent
          ? (this.open = Math.max(0, this.open - 1))
          : o && o.skip.nodeType && (t = o.skip);
        var i,
          s = this.top,
          a = this.needsBlock;
        if (ot.hasOwnProperty(r)) (i = !0), s.type || (this.needsBlock = !0);
        else if (!t.firstChild) return void this.leafFallback(t);
        this.addAll(t), i && this.sync(s), (this.needsBlock = a);
      } else this.addElementByRule(t, o, !1 === o.consuming ? n : null);
    }),
    (ht.prototype.leafFallback = function (t) {
      'BR' == t.nodeName &&
        this.top.type &&
        this.top.type.inlineContent &&
        this.addTextNode(t.ownerDocument.createTextNode('\n'));
    }),
    (ht.prototype.ignoreFallback = function (t) {
      'BR' != t.nodeName ||
        (this.top.type && this.top.type.inlineContent) ||
        this.findPlace(this.parser.schema.text('-'));
    }),
    (ht.prototype.readStyles = function (t) {
      var e = h.none;
      t: for (var n = 0; n < t.length; n += 2)
        for (var r = null; ; ) {
          var o = this.parser.matchStyle(t[n], t[n + 1], this, r);
          if (!o) continue t;
          if (o.ignore) return null;
          if (
            ((e = this.parser.schema.marks[o.mark].create(o.attrs).addToSet(e)),
            !1 !== o.consuming)
          )
            break;
          r = o;
        }
      return e;
    }),
    (ht.prototype.addElementByRule = function (t, e, n) {
      var r,
        o,
        i,
        s = this;
      e.node
        ? (o = this.parser.schema.nodes[e.node]).isLeaf
          ? this.insertNode(o.create(e.attrs)) || this.leafFallback(t)
          : (r = this.enter(o, e.attrs, e.preserveWhitespace))
        : ((i = this.parser.schema.marks[e.mark].create(e.attrs)),
          this.addPendingMark(i));
      var a = this.top;
      if (o && o.isLeaf) this.findInside(t);
      else if (n) this.addElement(t, n);
      else if (e.getContent)
        this.findInside(t),
          e.getContent(t, this.parser.schema).forEach(function (t) {
            return s.insertNode(t);
          });
      else {
        var c = e.contentElement;
        'string' == typeof c
          ? (c = t.querySelector(c))
          : 'function' == typeof c && (c = c(t)),
          c || (c = t),
          this.findAround(t, c, !0),
          this.addAll(c, r);
      }
      r && (this.sync(a), this.open--), i && this.removePendingMark(i, a);
    }),
    (ht.prototype.addAll = function (t, e, n, r) {
      for (
        var o = n || 0,
          i = n ? t.childNodes[n] : t.firstChild,
          s = null == r ? null : t.childNodes[r];
        i != s;
        i = i.nextSibling, ++o
      )
        this.findAtPoint(t, o),
          this.addDOM(i),
          e && ot.hasOwnProperty(i.nodeName.toLowerCase()) && this.sync(e);
      this.findAtPoint(t, o);
    }),
    (ht.prototype.findPlace = function (t) {
      for (var e, n, r = this.open; r >= 0; r--) {
        var o = this.nodes[r],
          i = o.findWrapping(t);
        if (i && (!e || e.length > i.length) && ((e = i), (n = o), !i.length))
          break;
        if (o.solid) break;
      }
      if (!e) return !1;
      this.sync(n);
      for (var s = 0; s < e.length; s++) this.enterInner(e[s], null, !1);
      return !0;
    }),
    (ht.prototype.insertNode = function (t) {
      if (t.isInline && this.needsBlock && !this.top.type) {
        var e = this.textblockFromContext();
        e && this.enterInner(e);
      }
      if (this.findPlace(t)) {
        this.closeExtra();
        var n = this.top;
        n.applyPending(t.type),
          n.match && (n.match = n.match.matchType(t.type));
        for (var r = n.activeMarks, o = 0; o < t.marks.length; o++)
          (n.type && !n.type.allowsMarkType(t.marks[o].type)) ||
            (r = t.marks[o].addToSet(r));
        return n.content.push(t.mark(r)), !0;
      }
      return !1;
    }),
    (ht.prototype.enter = function (t, e, n) {
      var r = this.findPlace(t.create(e));
      return r && this.enterInner(t, e, !0, n), r;
    }),
    (ht.prototype.enterInner = function (t, e, n, r) {
      this.closeExtra();
      var o = this.top;
      o.applyPending(t), (o.match = o.match && o.match.matchType(t, e));
      var i = null == r ? -5 & o.options : at(r);
      4 & o.options && 0 == o.content.length && (i |= 4),
        this.nodes.push(
          new ct(t, e, o.activeMarks, o.pendingMarks, n, null, i),
        ),
        this.open++;
    }),
    (ht.prototype.closeExtra = function (t) {
      var e = this.nodes.length - 1;
      if (e > this.open) {
        for (; e > this.open; e--)
          this.nodes[e - 1].content.push(this.nodes[e].finish(t));
        this.nodes.length = this.open + 1;
      }
    }),
    (ht.prototype.finish = function () {
      return (
        (this.open = 0),
        this.closeExtra(this.isOpen),
        this.nodes[0].finish(this.isOpen || this.options.topOpen)
      );
    }),
    (ht.prototype.sync = function (t) {
      for (var e = this.open; e >= 0; e--)
        if (this.nodes[e] == t) return void (this.open = e);
    }),
    (pt.currentPos.get = function () {
      this.closeExtra();
      for (var t = 0, e = this.open; e >= 0; e--) {
        for (var n = this.nodes[e].content, r = n.length - 1; r >= 0; r--)
          t += n[r].nodeSize;
        e && t++;
      }
      return t;
    }),
    (ht.prototype.findAtPoint = function (t, e) {
      if (this.find)
        for (var n = 0; n < this.find.length; n++)
          this.find[n].node == t &&
            this.find[n].offset == e &&
            (this.find[n].pos = this.currentPos);
    }),
    (ht.prototype.findInside = function (t) {
      if (this.find)
        for (var e = 0; e < this.find.length; e++)
          null == this.find[e].pos &&
            1 == t.nodeType &&
            t.contains(this.find[e].node) &&
            (this.find[e].pos = this.currentPos);
    }),
    (ht.prototype.findAround = function (t, e, n) {
      if (t != e && this.find)
        for (var r = 0; r < this.find.length; r++)
          null == this.find[r].pos &&
            1 == t.nodeType &&
            t.contains(this.find[r].node) &&
            e.compareDocumentPosition(this.find[r].node) & (n ? 2 : 4) &&
            (this.find[r].pos = this.currentPos);
    }),
    (ht.prototype.findInText = function (t) {
      if (this.find)
        for (var e = 0; e < this.find.length; e++)
          this.find[e].node == t &&
            (this.find[e].pos =
              this.currentPos - (t.nodeValue.length - this.find[e].offset));
    }),
    (ht.prototype.matchesContext = function (t) {
      var e = this;
      if (t.indexOf('|') > -1)
        return t.split(/\s*\|\s*/).some(this.matchesContext, this);
      var n = t.split('/'),
        r = this.options.context,
        o = !(this.isOpen || (r && r.parent.type != this.nodes[0].type)),
        i = -(r ? r.depth + 1 : 0) + (o ? 0 : 1),
        s = function (t, a) {
          for (; t >= 0; t--) {
            var c = n[t];
            if ('' == c) {
              if (t == n.length - 1 || 0 == t) continue;
              for (; a >= i; a--) if (s(t - 1, a)) return !0;
              return !1;
            }
            var h =
              a > 0 || (0 == a && o)
                ? e.nodes[a].type
                : r && a >= i
                ? r.node(a - i).type
                : null;
            if (!h || (h.name != c && -1 == h.groups.indexOf(c))) return !1;
            a--;
          }
          return !0;
        };
      return s(n.length - 1, this.open);
    }),
    (ht.prototype.textblockFromContext = function () {
      var t = this.options.context;
      if (t)
        for (var e = t.depth; e >= 0; e--) {
          var n = t.node(e).contentMatchAt(t.indexAfter(e)).defaultType;
          if (n && n.isTextblock && n.defaultAttrs) return n;
        }
      for (var r in this.parser.schema.nodes) {
        var o = this.parser.schema.nodes[r];
        if (o.isTextblock && o.defaultAttrs) return o;
      }
    }),
    (ht.prototype.addPendingMark = function (t) {
      var e = (function (t, e) {
        for (var n = 0; n < e.length; n++) if (t.eq(e[n])) return e[n];
      })(t, this.top.pendingMarks);
      e && this.top.stashMarks.push(e),
        (this.top.pendingMarks = t.addToSet(this.top.pendingMarks));
    }),
    (ht.prototype.removePendingMark = function (t, e) {
      for (var n = this.open; n >= 0; n--) {
        var r = this.nodes[n];
        if (r.pendingMarks.lastIndexOf(t) > -1)
          r.pendingMarks = t.removeFromSet(r.pendingMarks);
        else {
          r.activeMarks = t.removeFromSet(r.activeMarks);
          var o = r.popFromStashMark(t);
          o &&
            r.type &&
            r.type.allowsMarkType(o.type) &&
            (r.activeMarks = o.addToSet(r.activeMarks));
        }
        if (r == e) break;
      }
    }),
    Object.defineProperties(ht.prototype, pt);
  var dt = function (t, e) {
    (this.nodes = t || {}), (this.marks = e || {});
  };
  function mt(t) {
    var e = {};
    for (var n in t) {
      var r = t[n].spec.toDOM;
      r && (e[n] = r);
    }
    return e;
  }
  function vt(t) {
    return t.document || window.document;
  }
  (dt.prototype.serializeFragment = function (t, e, n) {
    var r = this;
    void 0 === e && (e = {}), n || (n = vt(e).createDocumentFragment());
    var o = n,
      i = null;
    return (
      t.forEach(function (t) {
        if (i || t.marks.length) {
          i || (i = []);
          for (var n = 0, s = 0; n < i.length && s < t.marks.length; ) {
            var a = t.marks[s];
            if (r.marks[a.type.name]) {
              if (!a.eq(i[n]) || !1 === a.type.spec.spanning) break;
              (n += 2), s++;
            } else s++;
          }
          for (; n < i.length; ) (o = i.pop()), i.pop();
          for (; s < t.marks.length; ) {
            var c = t.marks[s++],
              h = r.serializeMark(c, t.isInline, e);
            h &&
              (i.push(c, o), o.appendChild(h.dom), (o = h.contentDOM || h.dom));
          }
        }
        o.appendChild(r.serializeNode(t, e));
      }),
      n
    );
  }),
    (dt.prototype.serializeNode = function (t, e) {
      void 0 === e && (e = {});
      var n = dt.renderSpec(vt(e), this.nodes[t.type.name](t)),
        r = n.dom,
        o = n.contentDOM;
      if (o) {
        if (t.isLeaf)
          throw new RangeError('Content hole not allowed in a leaf node spec');
        e.onContent
          ? e.onContent(t, o, e)
          : this.serializeFragment(t.content, e, o);
      }
      return r;
    }),
    (dt.prototype.serializeNodeAndMarks = function (t, e) {
      void 0 === e && (e = {});
      for (
        var n = this.serializeNode(t, e), r = t.marks.length - 1;
        r >= 0;
        r--
      ) {
        var o = this.serializeMark(t.marks[r], t.isInline, e);
        o && ((o.contentDOM || o.dom).appendChild(n), (n = o.dom));
      }
      return n;
    }),
    (dt.prototype.serializeMark = function (t, e, n) {
      void 0 === n && (n = {});
      var r = this.marks[t.type.name];
      return r && dt.renderSpec(vt(n), r(t, e));
    }),
    (dt.renderSpec = function (t, e, n) {
      if ((void 0 === n && (n = null), 'string' == typeof e))
        return { dom: t.createTextNode(e) };
      if (null != e.nodeType) return { dom: e };
      if (e.dom && null != e.dom.nodeType) return e;
      var r = e[0],
        o = r.indexOf(' ');
      o > 0 && ((n = r.slice(0, o)), (r = r.slice(o + 1)));
      var i = null,
        s = n ? t.createElementNS(n, r) : t.createElement(r),
        a = e[1],
        c = 1;
      if (a && 'object' == typeof a && null == a.nodeType && !Array.isArray(a))
        for (var h in ((c = 2), a))
          if (null != a[h]) {
            var p = h.indexOf(' ');
            p > 0
              ? s.setAttributeNS(h.slice(0, p), h.slice(p + 1), a[h])
              : s.setAttribute(h, a[h]);
          }
      for (var l = c; l < e.length; l++) {
        var f = e[l];
        if (0 === f) {
          if (l < e.length - 1 || l > c)
            throw new RangeError(
              'Content hole must be the only child of its parent node',
            );
          return { dom: s, contentDOM: s };
        }
        var u = dt.renderSpec(t, f, n),
          d = u.dom,
          m = u.contentDOM;
        if ((s.appendChild(d), m)) {
          if (i) throw new RangeError('Multiple content holes');
          i = m;
        }
      }
      return { dom: s, contentDOM: i };
    }),
    (dt.fromSchema = function (t) {
      return (
        t.cached.domSerializer ||
        (t.cached.domSerializer = new dt(
          this.nodesFromSchema(t),
          this.marksFromSchema(t),
        ))
      );
    }),
    (dt.nodesFromSchema = function (t) {
      var e = mt(t.nodes);
      return (
        e.text ||
          (e.text = function (t) {
            return t.text;
          }),
        e
      );
    }),
    (dt.marksFromSchema = function (t) {
      return mt(t.marks);
    });
  var gt = ['p', 0],
    yt = ['blockquote', 0],
    wt = ['hr'],
    bt = ['pre', ['code', 0]],
    kt = ['br'],
    St = ['em', 0],
    xt = ['strong', 0],
    Ot = ['code', 0],
    Mt = new et({
      nodes: {
        doc: { content: 'block+' },
        paragraph: {
          content: 'inline*',
          group: 'block',
          parseDOM: [{ tag: 'p' }],
          toDOM: function () {
            return gt;
          },
        },
        blockquote: {
          content: 'block+',
          group: 'block',
          defining: !0,
          parseDOM: [{ tag: 'blockquote' }],
          toDOM: function () {
            return yt;
          },
        },
        horizontal_rule: {
          group: 'block',
          parseDOM: [{ tag: 'hr' }],
          toDOM: function () {
            return wt;
          },
        },
        heading: {
          attrs: { level: { default: 1 } },
          content: 'inline*',
          group: 'block',
          defining: !0,
          parseDOM: [
            { tag: 'h1', attrs: { level: 1 } },
            { tag: 'h2', attrs: { level: 2 } },
            { tag: 'h3', attrs: { level: 3 } },
            { tag: 'h4', attrs: { level: 4 } },
            { tag: 'h5', attrs: { level: 5 } },
            { tag: 'h6', attrs: { level: 6 } },
          ],
          toDOM: function (t) {
            return ['h' + t.attrs.level, 0];
          },
        },
        code_block: {
          content: 'text*',
          marks: '',
          group: 'block',
          code: !0,
          defining: !0,
          parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
          toDOM: function () {
            return bt;
          },
        },
        text: { group: 'inline' },
        image: {
          inline: !0,
          attrs: { src: {}, alt: { default: null }, title: { default: null } },
          group: 'inline',
          draggable: !0,
          parseDOM: [
            {
              tag: 'img[src]',
              getAttrs: function (t) {
                return {
                  src: t.getAttribute('src'),
                  title: t.getAttribute('title'),
                  alt: t.getAttribute('alt'),
                };
              },
            },
          ],
          toDOM: function (t) {
            var e = t.attrs;
            return ['img', { src: e.src, alt: e.alt, title: e.title }];
          },
        },
        hard_break: {
          inline: !0,
          group: 'inline',
          selectable: !1,
          parseDOM: [{ tag: 'br' }],
          toDOM: function () {
            return kt;
          },
        },
      },
      marks: {
        link: {
          attrs: { href: {}, title: { default: null } },
          inclusive: !1,
          parseDOM: [
            {
              tag: 'a[href]',
              getAttrs: function (t) {
                return {
                  href: t.getAttribute('href'),
                  title: t.getAttribute('title'),
                };
              },
            },
          ],
          toDOM: function (t) {
            var e = t.attrs;
            return ['a', { href: e.href, title: e.title }, 0];
          },
        },
        em: {
          parseDOM: [
            { tag: 'i' },
            { tag: 'em' },
            { style: 'font-style=italic' },
          ],
          toDOM: function () {
            return St;
          },
        },
        strong: {
          parseDOM: [
            { tag: 'strong' },
            {
              tag: 'b',
              getAttrs: function (t) {
                return 'normal' != t.style.fontWeight && null;
              },
            },
            {
              style: 'font-weight',
              getAttrs: function (t) {
                return /^(bold(er)?|[5-9]\d{2,})$/.test(t) && null;
              },
            },
          ],
          toDOM: function () {
            return xt;
          },
        },
        code: {
          parseDOM: [{ tag: 'code' }],
          toDOM: function () {
            return Ot;
          },
        },
      },
    }),
    Ct = Math.pow(2, 16);
  function Nt(t) {
    return 65535 & t;
  }
  var Dt = function (t, e, n) {
      void 0 === e && (e = !1),
        void 0 === n && (n = null),
        (this.pos = t),
        (this.deleted = e),
        (this.recover = n);
    },
    Tt = function (t, e) {
      void 0 === e && (e = !1), (this.ranges = t), (this.inverted = e);
    };
  (Tt.prototype.recover = function (t) {
    var e = 0,
      n = Nt(t);
    if (!this.inverted)
      for (var r = 0; r < n; r++)
        e += this.ranges[3 * r + 2] - this.ranges[3 * r + 1];
    return (
      this.ranges[3 * n] +
      e +
      (function (t) {
        return (t - (65535 & t)) / Ct;
      })(t)
    );
  }),
    (Tt.prototype.mapResult = function (t, e) {
      return void 0 === e && (e = 1), this._map(t, e, !1);
    }),
    (Tt.prototype.map = function (t, e) {
      return void 0 === e && (e = 1), this._map(t, e, !0);
    }),
    (Tt.prototype._map = function (t, e, n) {
      for (
        var r = 0, o = this.inverted ? 2 : 1, i = this.inverted ? 1 : 2, s = 0;
        s < this.ranges.length;
        s += 3
      ) {
        var a = this.ranges[s] - (this.inverted ? r : 0);
        if (a > t) break;
        var c = this.ranges[s + o],
          h = this.ranges[s + i],
          p = a + c;
        if (t <= p) {
          var l =
            a + r + ((c ? (t == a ? -1 : t == p ? 1 : e) : e) < 0 ? 0 : h);
          return n
            ? l
            : new Dt(
                l,
                e < 0 ? t != a : t != p,
                t == (e < 0 ? a : p) ? null : s / 3 + (t - a) * Ct,
              );
        }
        r += h - c;
      }
      return n ? t + r : new Dt(t + r);
    }),
    (Tt.prototype.touches = function (t, e) {
      for (
        var n = 0,
          r = Nt(e),
          o = this.inverted ? 2 : 1,
          i = this.inverted ? 1 : 2,
          s = 0;
        s < this.ranges.length;
        s += 3
      ) {
        var a = this.ranges[s] - (this.inverted ? n : 0);
        if (a > t) break;
        var c = this.ranges[s + o];
        if (t <= a + c && s == 3 * r) return !0;
        n += this.ranges[s + i] - c;
      }
      return !1;
    }),
    (Tt.prototype.forEach = function (t) {
      for (
        var e = this.inverted ? 2 : 1, n = this.inverted ? 1 : 2, r = 0, o = 0;
        r < this.ranges.length;
        r += 3
      ) {
        var i = this.ranges[r],
          s = i - (this.inverted ? o : 0),
          a = i + (this.inverted ? 0 : o),
          c = this.ranges[r + e],
          h = this.ranges[r + n];
        t(s, s + c, a, a + h), (o += h - c);
      }
    }),
    (Tt.prototype.invert = function () {
      return new Tt(this.ranges, !this.inverted);
    }),
    (Tt.prototype.toString = function () {
      return (this.inverted ? '-' : '') + JSON.stringify(this.ranges);
    }),
    (Tt.offset = function (t) {
      return 0 == t ? Tt.empty : new Tt(t < 0 ? [0, -t, 0] : [0, 0, t]);
    }),
    (Tt.empty = new Tt([]));
  var Et = function (t, e, n, r) {
    (this.maps = t || []),
      (this.from = n || 0),
      (this.to = null == r ? this.maps.length : r),
      (this.mirror = e);
  };
  function At(t) {
    var e = Error.call(this, t);
    return (e.__proto__ = At.prototype), e;
  }
  (Et.prototype.slice = function (t, e) {
    return (
      void 0 === t && (t = 0),
      void 0 === e && (e = this.maps.length),
      new Et(this.maps, this.mirror, t, e)
    );
  }),
    (Et.prototype.copy = function () {
      return new Et(
        this.maps.slice(),
        this.mirror && this.mirror.slice(),
        this.from,
        this.to,
      );
    }),
    (Et.prototype.appendMap = function (t, e) {
      (this.to = this.maps.push(t)),
        null != e && this.setMirror(this.maps.length - 1, e);
    }),
    (Et.prototype.appendMapping = function (t) {
      for (var e = 0, n = this.maps.length; e < t.maps.length; e++) {
        var r = t.getMirror(e);
        this.appendMap(t.maps[e], null != r && r < e ? n + r : null);
      }
    }),
    (Et.prototype.getMirror = function (t) {
      if (this.mirror)
        for (var e = 0; e < this.mirror.length; e++)
          if (this.mirror[e] == t) return this.mirror[e + (e % 2 ? -1 : 1)];
    }),
    (Et.prototype.setMirror = function (t, e) {
      this.mirror || (this.mirror = []), this.mirror.push(t, e);
    }),
    (Et.prototype.appendMappingInverted = function (t) {
      for (
        var e = t.maps.length - 1, n = this.maps.length + t.maps.length;
        e >= 0;
        e--
      ) {
        var r = t.getMirror(e);
        this.appendMap(
          t.maps[e].invert(),
          null != r && r > e ? n - r - 1 : null,
        );
      }
    }),
    (Et.prototype.invert = function () {
      var t = new Et();
      return t.appendMappingInverted(this), t;
    }),
    (Et.prototype.map = function (t, e) {
      if ((void 0 === e && (e = 1), this.mirror)) return this._map(t, e, !0);
      for (var n = this.from; n < this.to; n++) t = this.maps[n].map(t, e);
      return t;
    }),
    (Et.prototype.mapResult = function (t, e) {
      return void 0 === e && (e = 1), this._map(t, e, !1);
    }),
    (Et.prototype._map = function (t, e, n) {
      for (var r = !1, o = this.from; o < this.to; o++) {
        var i = this.maps[o].mapResult(t, e);
        if (null != i.recover) {
          var s = this.getMirror(o);
          if (null != s && s > o && s < this.to) {
            (o = s), (t = this.maps[s].recover(i.recover));
            continue;
          }
        }
        i.deleted && (r = !0), (t = i.pos);
      }
      return n ? t : new Dt(t, r);
    }),
    (At.prototype = Object.create(Error.prototype)),
    (At.prototype.constructor = At),
    (At.prototype.name = 'TransformError');
  var Rt = function (t) {
      (this.doc = t),
        (this.steps = []),
        (this.docs = []),
        (this.mapping = new Et());
    },
    zt = { before: { configurable: !0 }, docChanged: { configurable: !0 } };
  function Pt() {
    throw new Error('Override me');
  }
  (zt.before.get = function () {
    return this.docs.length ? this.docs[0] : this.doc;
  }),
    (Rt.prototype.step = function (t) {
      var e = this.maybeStep(t);
      if (e.failed) throw new At(e.failed);
      return this;
    }),
    (Rt.prototype.maybeStep = function (t) {
      var e = t.apply(this.doc);
      return e.failed || this.addStep(t, e.doc), e;
    }),
    (zt.docChanged.get = function () {
      return this.steps.length > 0;
    }),
    (Rt.prototype.addStep = function (t, e) {
      this.docs.push(this.doc),
        this.steps.push(t),
        this.mapping.appendMap(t.getMap()),
        (this.doc = e);
    }),
    Object.defineProperties(Rt.prototype, zt);
  var It = Object.create(null),
    Bt = function () {};
  (Bt.prototype.apply = function (t) {
    return Pt();
  }),
    (Bt.prototype.getMap = function () {
      return Tt.empty;
    }),
    (Bt.prototype.invert = function (t) {
      return Pt();
    }),
    (Bt.prototype.map = function (t) {
      return Pt();
    }),
    (Bt.prototype.merge = function (t) {
      return null;
    }),
    (Bt.prototype.toJSON = function () {
      return Pt();
    }),
    (Bt.fromJSON = function (t, e) {
      if (!e || !e.stepType)
        throw new RangeError('Invalid input for Step.fromJSON');
      var n = It[e.stepType];
      if (!n) throw new RangeError('No step type ' + e.stepType + ' defined');
      return n.fromJSON(t, e);
    }),
    (Bt.jsonID = function (t, e) {
      if (t in It) throw new RangeError('Duplicate use of step JSON ID ' + t);
      return (It[t] = e), (e.prototype.jsonID = t), e;
    });
  var Ft = function (t, e) {
    (this.doc = t), (this.failed = e);
  };
  (Ft.ok = function (t) {
    return new Ft(t, null);
  }),
    (Ft.fail = function (t) {
      return new Ft(null, t);
    }),
    (Ft.fromReplace = function (t, e, n, r) {
      try {
        return Ft.ok(t.replace(e, n, r));
      } catch (t) {
        if (t instanceof p) return Ft.fail(t.message);
        throw t;
      }
    });
  var Vt = (function (t) {
    function e(e, n, r, o) {
      t.call(this),
        (this.from = e),
        (this.to = n),
        (this.slice = r),
        (this.structure = !!o);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.apply = function (t) {
        return this.structure && $t(t, this.from, this.to)
          ? Ft.fail('Structure replace would overwrite content')
          : Ft.fromReplace(t, this.from, this.to, this.slice);
      }),
      (e.prototype.getMap = function () {
        return new Tt([this.from, this.to - this.from, this.slice.size]);
      }),
      (e.prototype.invert = function (t) {
        return new e(
          this.from,
          this.from + this.slice.size,
          t.slice(this.from, this.to),
        );
      }),
      (e.prototype.map = function (t) {
        var n = t.mapResult(this.from, 1),
          r = t.mapResult(this.to, -1);
        return n.deleted && r.deleted
          ? null
          : new e(n.pos, Math.max(n.pos, r.pos), this.slice);
      }),
      (e.prototype.merge = function (t) {
        if (!(t instanceof e) || t.structure || this.structure) return null;
        if (
          this.from + this.slice.size != t.from ||
          this.slice.openEnd ||
          t.slice.openStart
        ) {
          if (t.to != this.from || this.slice.openStart || t.slice.openEnd)
            return null;
          var n =
            this.slice.size + t.slice.size == 0
              ? l.empty
              : new l(
                  t.slice.content.append(this.slice.content),
                  t.slice.openStart,
                  this.slice.openEnd,
                );
          return new e(t.from, this.to, n, this.structure);
        }
        var r =
          this.slice.size + t.slice.size == 0
            ? l.empty
            : new l(
                this.slice.content.append(t.slice.content),
                this.slice.openStart,
                t.slice.openEnd,
              );
        return new e(this.from, this.to + (t.to - t.from), r, this.structure);
      }),
      (e.prototype.toJSON = function () {
        var t = { stepType: 'replace', from: this.from, to: this.to };
        return (
          this.slice.size && (t.slice = this.slice.toJSON()),
          this.structure && (t.structure = !0),
          t
        );
      }),
      (e.fromJSON = function (t, n) {
        if ('number' != typeof n.from || 'number' != typeof n.to)
          throw new RangeError('Invalid input for ReplaceStep.fromJSON');
        return new e(n.from, n.to, l.fromJSON(t, n.slice), !!n.structure);
      }),
      e
    );
  })(Bt);
  Bt.jsonID('replace', Vt);
  var _t = (function (t) {
    function e(e, n, r, o, i, s, a) {
      t.call(this),
        (this.from = e),
        (this.to = n),
        (this.gapFrom = r),
        (this.gapTo = o),
        (this.slice = i),
        (this.insert = s),
        (this.structure = !!a);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.apply = function (t) {
        if (
          this.structure &&
          ($t(t, this.from, this.gapFrom) || $t(t, this.gapTo, this.to))
        )
          return Ft.fail('Structure gap-replace would overwrite content');
        var e = t.slice(this.gapFrom, this.gapTo);
        if (e.openStart || e.openEnd) return Ft.fail('Gap is not a flat range');
        var n = this.slice.insertAt(this.insert, e.content);
        return n
          ? Ft.fromReplace(t, this.from, this.to, n)
          : Ft.fail('Content does not fit in gap');
      }),
      (e.prototype.getMap = function () {
        return new Tt([
          this.from,
          this.gapFrom - this.from,
          this.insert,
          this.gapTo,
          this.to - this.gapTo,
          this.slice.size - this.insert,
        ]);
      }),
      (e.prototype.invert = function (t) {
        var n = this.gapTo - this.gapFrom;
        return new e(
          this.from,
          this.from + this.slice.size + n,
          this.from + this.insert,
          this.from + this.insert + n,
          t
            .slice(this.from, this.to)
            .removeBetween(this.gapFrom - this.from, this.gapTo - this.from),
          this.gapFrom - this.from,
          this.structure,
        );
      }),
      (e.prototype.map = function (t) {
        var n = t.mapResult(this.from, 1),
          r = t.mapResult(this.to, -1),
          o = t.map(this.gapFrom, -1),
          i = t.map(this.gapTo, 1);
        return (n.deleted && r.deleted) || o < n.pos || i > r.pos
          ? null
          : new e(n.pos, r.pos, o, i, this.slice, this.insert, this.structure);
      }),
      (e.prototype.toJSON = function () {
        var t = {
          stepType: 'replaceAround',
          from: this.from,
          to: this.to,
          gapFrom: this.gapFrom,
          gapTo: this.gapTo,
          insert: this.insert,
        };
        return (
          this.slice.size && (t.slice = this.slice.toJSON()),
          this.structure && (t.structure = !0),
          t
        );
      }),
      (e.fromJSON = function (t, n) {
        if (
          'number' != typeof n.from ||
          'number' != typeof n.to ||
          'number' != typeof n.gapFrom ||
          'number' != typeof n.gapTo ||
          'number' != typeof n.insert
        )
          throw new RangeError('Invalid input for ReplaceAroundStep.fromJSON');
        return new e(
          n.from,
          n.to,
          n.gapFrom,
          n.gapTo,
          l.fromJSON(t, n.slice),
          n.insert,
          !!n.structure,
        );
      }),
      e
    );
  })(Bt);
  function $t(t, e, n) {
    for (
      var r = t.resolve(e), o = n - e, i = r.depth;
      o > 0 && i > 0 && r.indexAfter(i) == r.node(i).childCount;

    )
      i--, o--;
    if (o > 0)
      for (var s = r.node(i).maybeChild(r.indexAfter(i)); o > 0; ) {
        if (!s || s.isLeaf) return !0;
        (s = s.firstChild), o--;
      }
    return !1;
  }
  function jt(t, e, n) {
    for (var r = [], i = 0; i < t.childCount; i++) {
      var s = t.child(i);
      s.content.size && (s = s.copy(jt(s.content, e, s))),
        s.isInline && (s = e(s, n, i)),
        r.push(s);
    }
    return o.fromArray(r);
  }
  Bt.jsonID('replaceAround', _t),
    (Rt.prototype.lift = function (t, e) {
      for (
        var n = t.$from,
          r = t.$to,
          i = t.depth,
          s = n.before(i + 1),
          a = r.after(i + 1),
          c = s,
          h = a,
          p = o.empty,
          f = 0,
          u = i,
          d = !1;
        u > e;
        u--
      )
        d || n.index(u) > 0
          ? ((d = !0), (p = o.from(n.node(u).copy(p))), f++)
          : c--;
      for (var m = o.empty, v = 0, g = i, y = !1; g > e; g--)
        y || r.after(g + 1) < r.end(g)
          ? ((y = !0), (m = o.from(r.node(g).copy(m))), v++)
          : h++;
      return this.step(
        new _t(c, h, s, a, new l(p.append(m), f, v), p.size - f, !0),
      );
    }),
    (Rt.prototype.wrap = function (t, e) {
      for (var n = o.empty, r = e.length - 1; r >= 0; r--)
        n = o.from(e[r].type.create(e[r].attrs, n));
      var i = t.start,
        s = t.end;
      return this.step(new _t(i, s, i, s, new l(n, 0, 0), e.length, !0));
    }),
    (Rt.prototype.setBlockType = function (t, e, n, r) {
      var i = this;
      if ((void 0 === e && (e = t), !n.isTextblock))
        throw new RangeError(
          'Type given to setBlockType should be a textblock',
        );
      var s = this.steps.length;
      return (
        this.doc.nodesBetween(t, e, function (t, e) {
          if (
            t.isTextblock &&
            !t.hasMarkup(n, r) &&
            (function (t, e, n) {
              var r = t.resolve(e),
                o = r.index();
              return r.parent.canReplaceWith(o, o + 1, n);
            })(i.doc, i.mapping.slice(s).map(e), n)
          ) {
            i.clearIncompatible(i.mapping.slice(s).map(e, 1), n);
            var a = i.mapping.slice(s),
              c = a.map(e, 1),
              h = a.map(e + t.nodeSize, 1);
            return (
              i.step(
                new _t(
                  c,
                  h,
                  c + 1,
                  h - 1,
                  new l(o.from(n.create(r, null, t.marks)), 0, 0),
                  1,
                  !0,
                ),
              ),
              !1
            );
          }
        }),
        this
      );
    }),
    (Rt.prototype.setNodeMarkup = function (t, e, n, r) {
      var i = this.doc.nodeAt(t);
      if (!i) throw new RangeError('No node at given position');
      e || (e = i.type);
      var s = e.create(n, null, r || i.marks);
      if (i.isLeaf) return this.replaceWith(t, t + i.nodeSize, s);
      if (!e.validContent(i.content))
        throw new RangeError('Invalid content for node type ' + e.name);
      return this.step(
        new _t(
          t,
          t + i.nodeSize,
          t + 1,
          t + i.nodeSize - 1,
          new l(o.from(s), 0, 0),
          1,
          !0,
        ),
      );
    }),
    (Rt.prototype.split = function (t, e, n) {
      void 0 === e && (e = 1);
      for (
        var r = this.doc.resolve(t),
          i = o.empty,
          s = o.empty,
          a = r.depth,
          c = r.depth - e,
          h = e - 1;
        a > c;
        a--, h--
      ) {
        i = o.from(r.node(a).copy(i));
        var p = n && n[h];
        s = o.from(p ? p.type.create(p.attrs, s) : r.node(a).copy(s));
      }
      return this.step(new Vt(t, t, new l(i.append(s), e, e), !0));
    }),
    (Rt.prototype.join = function (t, e) {
      void 0 === e && (e = 1);
      var n = new Vt(t - e, t + e, l.empty, !0);
      return this.step(n);
    });
  var Lt = (function (t) {
    function e(e, n, r) {
      t.call(this), (this.from = e), (this.to = n), (this.mark = r);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.apply = function (t) {
        var e = this,
          n = t.slice(this.from, this.to),
          r = t.resolve(this.from),
          o = r.node(r.sharedDepth(this.to)),
          i = new l(
            jt(
              n.content,
              function (t, n) {
                return t.isAtom && n.type.allowsMarkType(e.mark.type)
                  ? t.mark(e.mark.addToSet(t.marks))
                  : t;
              },
              o,
            ),
            n.openStart,
            n.openEnd,
          );
        return Ft.fromReplace(t, this.from, this.to, i);
      }),
      (e.prototype.invert = function () {
        return new Jt(this.from, this.to, this.mark);
      }),
      (e.prototype.map = function (t) {
        var n = t.mapResult(this.from, 1),
          r = t.mapResult(this.to, -1);
        return (n.deleted && r.deleted) || n.pos >= r.pos
          ? null
          : new e(n.pos, r.pos, this.mark);
      }),
      (e.prototype.merge = function (t) {
        if (
          t instanceof e &&
          t.mark.eq(this.mark) &&
          this.from <= t.to &&
          this.to >= t.from
        )
          return new e(
            Math.min(this.from, t.from),
            Math.max(this.to, t.to),
            this.mark,
          );
      }),
      (e.prototype.toJSON = function () {
        return {
          stepType: 'addMark',
          mark: this.mark.toJSON(),
          from: this.from,
          to: this.to,
        };
      }),
      (e.fromJSON = function (t, n) {
        if ('number' != typeof n.from || 'number' != typeof n.to)
          throw new RangeError('Invalid input for AddMarkStep.fromJSON');
        return new e(n.from, n.to, t.markFromJSON(n.mark));
      }),
      e
    );
  })(Bt);
  Bt.jsonID('addMark', Lt);
  var Jt = (function (t) {
    function e(e, n, r) {
      t.call(this), (this.from = e), (this.to = n), (this.mark = r);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.apply = function (t) {
        var e = this,
          n = t.slice(this.from, this.to),
          r = new l(
            jt(n.content, function (t) {
              return t.mark(e.mark.removeFromSet(t.marks));
            }),
            n.openStart,
            n.openEnd,
          );
        return Ft.fromReplace(t, this.from, this.to, r);
      }),
      (e.prototype.invert = function () {
        return new Lt(this.from, this.to, this.mark);
      }),
      (e.prototype.map = function (t) {
        var n = t.mapResult(this.from, 1),
          r = t.mapResult(this.to, -1);
        return (n.deleted && r.deleted) || n.pos >= r.pos
          ? null
          : new e(n.pos, r.pos, this.mark);
      }),
      (e.prototype.merge = function (t) {
        if (
          t instanceof e &&
          t.mark.eq(this.mark) &&
          this.from <= t.to &&
          this.to >= t.from
        )
          return new e(
            Math.min(this.from, t.from),
            Math.max(this.to, t.to),
            this.mark,
          );
      }),
      (e.prototype.toJSON = function () {
        return {
          stepType: 'removeMark',
          mark: this.mark.toJSON(),
          from: this.from,
          to: this.to,
        };
      }),
      (e.fromJSON = function (t, n) {
        if ('number' != typeof n.from || 'number' != typeof n.to)
          throw new RangeError('Invalid input for RemoveMarkStep.fromJSON');
        return new e(n.from, n.to, t.markFromJSON(n.mark));
      }),
      e
    );
  })(Bt);
  function qt(t, e, n) {
    return (
      !n.openStart &&
      !n.openEnd &&
      t.start() == e.start() &&
      t.parent.canReplace(t.index(), e.index(), n.content)
    );
  }
  Bt.jsonID('removeMark', Jt),
    (Rt.prototype.addMark = function (t, e, n) {
      var r = this,
        o = [],
        i = [],
        s = null,
        a = null;
      return (
        this.doc.nodesBetween(t, e, function (r, c, h) {
          if (r.isInline) {
            var p = r.marks;
            if (!n.isInSet(p) && h.type.allowsMarkType(n.type)) {
              for (
                var l = Math.max(c, t),
                  f = Math.min(c + r.nodeSize, e),
                  u = n.addToSet(p),
                  d = 0;
                d < p.length;
                d++
              )
                p[d].isInSet(u) ||
                  (s && s.to == l && s.mark.eq(p[d])
                    ? (s.to = f)
                    : o.push((s = new Jt(l, f, p[d]))));
              a && a.to == l ? (a.to = f) : i.push((a = new Lt(l, f, n)));
            }
          }
        }),
        o.forEach(function (t) {
          return r.step(t);
        }),
        i.forEach(function (t) {
          return r.step(t);
        }),
        this
      );
    }),
    (Rt.prototype.removeMark = function (t, e, n) {
      var r = this;
      void 0 === n && (n = null);
      var o = [],
        i = 0;
      return (
        this.doc.nodesBetween(t, e, function (r, s) {
          if (r.isInline) {
            i++;
            var a = null;
            if (n instanceof tt)
              for (var c, h = r.marks; (c = n.isInSet(h)); )
                (a || (a = [])).push(c), (h = c.removeFromSet(h));
            else n ? n.isInSet(r.marks) && (a = [n]) : (a = r.marks);
            if (a && a.length)
              for (
                var p = Math.min(s + r.nodeSize, e), l = 0;
                l < a.length;
                l++
              ) {
                for (var f = a[l], u = void 0, d = 0; d < o.length; d++) {
                  var m = o[d];
                  m.step == i - 1 && f.eq(o[d].style) && (u = m);
                }
                u
                  ? ((u.to = p), (u.step = i))
                  : o.push({ style: f, from: Math.max(s, t), to: p, step: i });
              }
          }
        }),
        o.forEach(function (t) {
          return r.step(new Jt(t.from, t.to, t.style));
        }),
        this
      );
    }),
    (Rt.prototype.clearIncompatible = function (t, e, n) {
      void 0 === n && (n = e.contentMatch);
      for (
        var r = this.doc.nodeAt(t), i = [], s = t + 1, a = 0;
        a < r.childCount;
        a++
      ) {
        var c = r.child(a),
          h = s + c.nodeSize,
          p = n.matchType(c.type, c.attrs);
        if (p) {
          n = p;
          for (var f = 0; f < c.marks.length; f++)
            e.allowsMarkType(c.marks[f].type) ||
              this.step(new Jt(s, h, c.marks[f]));
        } else i.push(new Vt(s, h, l.empty));
        s = h;
      }
      if (!n.validEnd) {
        var u = n.fillBefore(o.empty, !0);
        this.replace(s, s, new l(u, 0, 0));
      }
      for (var d = i.length - 1; d >= 0; d--) this.step(i[d]);
      return this;
    }),
    (Rt.prototype.replace = function (t, e, n) {
      void 0 === e && (e = t), void 0 === n && (n = l.empty);
      var r = (function (t, e, n, r) {
        if (
          (void 0 === n && (n = e),
          void 0 === r && (r = l.empty),
          e == n && !r.size)
        )
          return null;
        var o = t.resolve(e),
          i = t.resolve(n);
        return qt(o, i, r) ? new Vt(e, n, r) : new Wt(o, i, r).fit();
      })(this.doc, t, e, n);
      return r && this.step(r), this;
    }),
    (Rt.prototype.replaceWith = function (t, e, n) {
      return this.replace(t, e, new l(o.from(n), 0, 0));
    }),
    (Rt.prototype.delete = function (t, e) {
      return this.replace(t, e, l.empty);
    }),
    (Rt.prototype.insert = function (t, e) {
      return this.replaceWith(t, t, e);
    });
  var Wt = function (t, e, n) {
      (this.$to = e),
        (this.$from = t),
        (this.unplaced = n),
        (this.frontier = []);
      for (var r = 0; r <= t.depth; r++) {
        var i = t.node(r);
        this.frontier.push({
          type: i.type,
          match: i.contentMatchAt(t.indexAfter(r)),
        });
      }
      this.placed = o.empty;
      for (var s = t.depth; s > 0; s--)
        this.placed = o.from(t.node(s).copy(this.placed));
    },
    Kt = { depth: { configurable: !0 } };
  function Ht(t, e, n) {
    return 0 == e
      ? t.cutByIndex(n)
      : t.replaceChild(
          0,
          t.firstChild.copy(Ht(t.firstChild.content, e - 1, n)),
        );
  }
  function Ut(t, e, n) {
    return 0 == e
      ? t.append(n)
      : t.replaceChild(
          t.childCount - 1,
          t.lastChild.copy(Ut(t.lastChild.content, e - 1, n)),
        );
  }
  function Gt(t, e) {
    for (var n = 0; n < e; n++) t = t.firstChild.content;
    return t;
  }
  function Xt(t, e, n) {
    if (e <= 0) return t;
    var r = t.content;
    return (
      e > 1 &&
        (r = r.replaceChild(
          0,
          Xt(r.firstChild, e - 1, 1 == r.childCount ? n - 1 : 0),
        )),
      e > 0 &&
        ((r = t.type.contentMatch.fillBefore(r).append(r)),
        n <= 0 &&
          (r = r.append(
            t.type.contentMatch.matchFragment(r).fillBefore(o.empty, !0),
          ))),
      t.copy(r)
    );
  }
  function Yt(t, e, n, r, o) {
    var i = t.node(e),
      s = o ? t.indexAfter(e) : t.index(e);
    if (s == i.childCount && !n.compatibleContent(i.type)) return null;
    var a = r.fillBefore(i.content, !0, s);
    return a &&
      !(function (t, e, n) {
        for (var r = n; r < e.childCount; r++)
          if (!t.allowsMarks(e.child(r).marks)) return !0;
        return !1;
      })(n, i.content, s)
      ? a
      : null;
  }
  function Qt(t, e, n, r, i) {
    if (e < n) {
      var s = t.firstChild;
      t = t.replaceChild(0, s.copy(Qt(s.content, e + 1, n, r, s)));
    }
    if (e > r) {
      var a = i.contentMatchAt(0),
        c = a.fillBefore(t).append(t);
      t = c.append(a.matchFragment(c).fillBefore(o.empty, !0));
    }
    return t;
  }
  function Zt(t, e) {
    for (var n = [], r = Math.min(t.depth, e.depth); r >= 0; r--) {
      var o = t.start(r);
      if (
        o < t.pos - (t.depth - r) ||
        e.end(r) > e.pos + (e.depth - r) ||
        t.node(r).type.spec.isolating ||
        e.node(r).type.spec.isolating
      )
        break;
      o == e.start(r) && n.push(r);
    }
    return n;
  }
  (Kt.depth.get = function () {
    return this.frontier.length - 1;
  }),
    (Wt.prototype.fit = function () {
      for (; this.unplaced.size; ) {
        var t = this.findFittable();
        t ? this.placeNodes(t) : this.openMore() || this.dropNode();
      }
      var e = this.mustMoveInline(),
        n = this.placed.size - this.depth - this.$from.depth,
        r = this.$from,
        o = this.close(e < 0 ? this.$to : r.doc.resolve(e));
      if (!o) return null;
      for (
        var i = this.placed, s = r.depth, a = o.depth;
        s && a && 1 == i.childCount;

      )
        (i = i.firstChild.content), s--, a--;
      var c = new l(i, s, a);
      return e > -1
        ? new _t(r.pos, e, this.$to.pos, this.$to.end(), c, n)
        : c.size || r.pos != this.$to.pos
        ? new Vt(r.pos, o.pos, c)
        : void 0;
    }),
    (Wt.prototype.findFittable = function () {
      for (var t = 1; t <= 2; t++)
        for (var e = this.unplaced.openStart; e >= 0; e--)
          for (
            var n = void 0,
              r = (e
                ? (n = Gt(this.unplaced.content, e - 1).firstChild).content
                : this.unplaced.content
              ).firstChild,
              i = this.depth;
            i >= 0;
            i--
          ) {
            var s = this.frontier[i],
              a = s.type,
              c = s.match,
              h = void 0,
              p = void 0;
            if (
              1 == t &&
              (r
                ? c.matchType(r.type) || (p = c.fillBefore(o.from(r), !1))
                : a.compatibleContent(n.type))
            )
              return { sliceDepth: e, frontierDepth: i, parent: n, inject: p };
            if (2 == t && r && (h = c.findWrapping(r.type)))
              return { sliceDepth: e, frontierDepth: i, parent: n, wrap: h };
            if (n && c.matchType(n.type)) break;
          }
    }),
    (Wt.prototype.openMore = function () {
      var t = this.unplaced,
        e = t.content,
        n = t.openStart,
        r = t.openEnd,
        o = Gt(e, n);
      return !(
        !o.childCount ||
        o.firstChild.isLeaf ||
        ((this.unplaced = new l(
          e,
          n + 1,
          Math.max(r, o.size + n >= e.size - r ? n + 1 : 0),
        )),
        0)
      );
    }),
    (Wt.prototype.dropNode = function () {
      var t = this.unplaced,
        e = t.content,
        n = t.openStart,
        r = t.openEnd,
        o = Gt(e, n);
      if (o.childCount <= 1 && n > 0) {
        var i = e.size - n <= n + o.size;
        this.unplaced = new l(Ht(e, n - 1, 1), n - 1, i ? n - 1 : r);
      } else this.unplaced = new l(Ht(e, n, 1), n, r);
    }),
    (Wt.prototype.placeNodes = function (t) {
      for (
        var e = t.sliceDepth,
          n = t.frontierDepth,
          r = t.parent,
          i = t.inject,
          s = t.wrap;
        this.depth > n;

      )
        this.closeFrontierNode();
      if (s) for (var a = 0; a < s.length; a++) this.openFrontierNode(s[a]);
      var c = this.unplaced,
        h = r ? r.content : c.content,
        p = c.openStart - e,
        f = 0,
        u = [],
        d = this.frontier[n],
        m = d.match,
        v = d.type;
      if (i) {
        for (var g = 0; g < i.childCount; g++) u.push(i.child(g));
        m = m.matchFragment(i);
      }
      for (
        var y = h.size + e - (c.content.size - c.openEnd);
        f < h.childCount;

      ) {
        var w = h.child(f),
          b = m.matchType(w.type);
        if (!b) break;
        (++f > 1 || 0 == p || w.content.size) &&
          ((m = b),
          u.push(
            Xt(
              w.mark(v.allowedMarks(w.marks)),
              1 == f ? p : 0,
              f == h.childCount ? y : -1,
            ),
          ));
      }
      var k = f == h.childCount;
      k || (y = -1),
        (this.placed = Ut(this.placed, n, o.from(u))),
        (this.frontier[n].match = m),
        k &&
          y < 0 &&
          r &&
          r.type == this.frontier[this.depth].type &&
          this.frontier.length > 1 &&
          this.closeFrontierNode();
      for (var S = 0, x = h; S < y; S++) {
        var O = x.lastChild;
        this.frontier.push({
          type: O.type,
          match: O.contentMatchAt(O.childCount),
        }),
          (x = O.content);
      }
      this.unplaced = k
        ? 0 == e
          ? l.empty
          : new l(Ht(c.content, e - 1, 1), e - 1, y < 0 ? c.openEnd : e - 1)
        : new l(Ht(c.content, e, f), c.openStart, c.openEnd);
    }),
    (Wt.prototype.mustMoveInline = function () {
      if (!this.$to.parent.isTextblock || this.$to.end() == this.$to.pos)
        return -1;
      var t,
        e = this.frontier[this.depth];
      if (
        !e.type.isTextblock ||
        !Yt(this.$to, this.$to.depth, e.type, e.match, !1) ||
        (this.$to.depth == this.depth &&
          (t = this.findCloseLevel(this.$to)) &&
          t.depth == this.depth)
      )
        return -1;
      for (
        var n = this.$to.depth, r = this.$to.after(n);
        n > 1 && r == this.$to.end(--n);

      )
        ++r;
      return r;
    }),
    (Wt.prototype.findCloseLevel = function (t) {
      t: for (var e = Math.min(this.depth, t.depth); e >= 0; e--) {
        var n = this.frontier[e],
          r = n.match,
          o = n.type,
          i = e < t.depth && t.end(e + 1) == t.pos + (t.depth - (e + 1)),
          s = Yt(t, e, o, r, i);
        if (s) {
          for (var a = e - 1; a >= 0; a--) {
            var c = this.frontier[a],
              h = c.match,
              p = Yt(t, a, c.type, h, !0);
            if (!p || p.childCount) continue t;
          }
          return {
            depth: e,
            fit: s,
            move: i ? t.doc.resolve(t.after(e + 1)) : t,
          };
        }
      }
    }),
    (Wt.prototype.close = function (t) {
      var e = this.findCloseLevel(t);
      if (!e) return null;
      for (; this.depth > e.depth; ) this.closeFrontierNode();
      e.fit.childCount && (this.placed = Ut(this.placed, e.depth, e.fit)),
        (t = e.move);
      for (var n = e.depth + 1; n <= t.depth; n++) {
        var r = t.node(n),
          o = r.type.contentMatch.fillBefore(r.content, !0, t.index(n));
        this.openFrontierNode(r.type, r.attrs, o);
      }
      return t;
    }),
    (Wt.prototype.openFrontierNode = function (t, e, n) {
      var r = this.frontier[this.depth];
      (r.match = r.match.matchType(t)),
        (this.placed = Ut(this.placed, this.depth, o.from(t.create(e, n)))),
        this.frontier.push({ type: t, match: t.contentMatch });
    }),
    (Wt.prototype.closeFrontierNode = function () {
      var t = this.frontier.pop().match.fillBefore(o.empty, !0);
      t.childCount && (this.placed = Ut(this.placed, this.frontier.length, t));
    }),
    Object.defineProperties(Wt.prototype, Kt),
    (Rt.prototype.replaceRange = function (t, e, n) {
      if (!n.size) return this.deleteRange(t, e);
      var r = this.doc.resolve(t),
        o = this.doc.resolve(e);
      if (qt(r, o, n)) return this.step(new Vt(t, e, n));
      var i = Zt(r, this.doc.resolve(e));
      0 == i[i.length - 1] && i.pop();
      var s = -(r.depth + 1);
      i.unshift(s);
      for (var a = r.depth, c = r.pos - 1; a > 0; a--, c--) {
        var h = r.node(a).type.spec;
        if (h.defining || h.isolating) break;
        i.indexOf(a) > -1 ? (s = a) : r.before(a) == c && i.splice(1, 0, -a);
      }
      for (
        var p = i.indexOf(s), f = [], u = n.openStart, d = n.content, m = 0;
        ;
        m++
      ) {
        var v = d.firstChild;
        if ((f.push(v), m == n.openStart)) break;
        d = v.content;
      }
      u > 0 && f[u - 1].type.spec.defining && r.node(p).type != f[u - 1].type
        ? (u -= 1)
        : u >= 2 &&
          f[u - 1].isTextblock &&
          f[u - 2].type.spec.defining &&
          r.node(p).type != f[u - 2].type &&
          (u -= 2);
      for (var g = n.openStart; g >= 0; g--) {
        var y = (g + u + 1) % (n.openStart + 1),
          w = f[y];
        if (w)
          for (var b = 0; b < i.length; b++) {
            var k = i[(b + p) % i.length],
              S = !0;
            k < 0 && ((S = !1), (k = -k));
            var x = r.node(k - 1),
              O = r.index(k - 1);
            if (x.canReplaceWith(O, O, w.type, w.marks))
              return this.replace(
                r.before(k),
                S ? o.after(k) : e,
                new l(Qt(n.content, 0, n.openStart, y), y, n.openEnd),
              );
          }
      }
      for (
        var M = this.steps.length, C = i.length - 1;
        C >= 0 && (this.replace(t, e, n), !(this.steps.length > M));
        C--
      ) {
        var N = i[C];
        N < 0 || ((t = r.before(N)), (e = o.after(N)));
      }
      return this;
    }),
    (Rt.prototype.replaceRangeWith = function (t, e, n) {
      if (!n.isInline && t == e && this.doc.resolve(t).parent.content.size) {
        var r = (function (t, e, n) {
          var r = t.resolve(e);
          if (r.parent.canReplaceWith(r.index(), r.index(), n)) return e;
          if (0 == r.parentOffset)
            for (var o = r.depth - 1; o >= 0; o--) {
              var i = r.index(o);
              if (r.node(o).canReplaceWith(i, i, n)) return r.before(o + 1);
              if (i > 0) return null;
            }
          if (r.parentOffset == r.parent.content.size)
            for (var s = r.depth - 1; s >= 0; s--) {
              var a = r.indexAfter(s);
              if (r.node(s).canReplaceWith(a, a, n)) return r.after(s + 1);
              if (a < r.node(s).childCount) return null;
            }
        })(this.doc, t, n.type);
        null != r && (t = e = r);
      }
      return this.replaceRange(t, e, new l(o.from(n), 0, 0));
    }),
    (Rt.prototype.deleteRange = function (t, e) {
      for (
        var n = this.doc.resolve(t),
          r = this.doc.resolve(e),
          o = Zt(n, r),
          i = 0;
        i < o.length;
        i++
      ) {
        var s = o[i],
          a = i == o.length - 1;
        if ((a && 0 == s) || n.node(s).type.contentMatch.validEnd)
          return this.delete(n.start(s), r.end(s));
        if (
          s > 0 &&
          (a || n.node(s - 1).canReplace(n.index(s - 1), r.indexAfter(s - 1)))
        )
          return this.delete(n.before(s), r.after(s));
      }
      for (var c = 1; c <= n.depth && c <= r.depth; c++)
        if (
          t - n.start(c) == n.depth - c &&
          e > n.end(c) &&
          r.end(c) - e != r.depth - c
        )
          return this.delete(n.before(c), e);
      return this.delete(t, e);
    });
  var te = Object.create(null),
    ee = function (t, e, n) {
      (this.ranges = n || [new re(t.min(e), t.max(e))]),
        (this.$anchor = t),
        (this.$head = e);
    },
    ne = {
      anchor: { configurable: !0 },
      head: { configurable: !0 },
      from: { configurable: !0 },
      to: { configurable: !0 },
      $from: { configurable: !0 },
      $to: { configurable: !0 },
      empty: { configurable: !0 },
    };
  (ne.anchor.get = function () {
    return this.$anchor.pos;
  }),
    (ne.head.get = function () {
      return this.$head.pos;
    }),
    (ne.from.get = function () {
      return this.$from.pos;
    }),
    (ne.to.get = function () {
      return this.$to.pos;
    }),
    (ne.$from.get = function () {
      return this.ranges[0].$from;
    }),
    (ne.$to.get = function () {
      return this.ranges[0].$to;
    }),
    (ne.empty.get = function () {
      for (var t = this.ranges, e = 0; e < t.length; e++)
        if (t[e].$from.pos != t[e].$to.pos) return !1;
      return !0;
    }),
    (ee.prototype.content = function () {
      return this.$from.node(0).slice(this.from, this.to, !0);
    }),
    (ee.prototype.replace = function (t, e) {
      void 0 === e && (e = l.empty);
      for (var n = e.content.lastChild, r = null, o = 0; o < e.openEnd; o++)
        (r = n), (n = n.lastChild);
      for (var i = t.steps.length, s = this.ranges, a = 0; a < s.length; a++) {
        var c = s[a],
          h = c.$from,
          p = c.$to,
          f = t.mapping.slice(i);
        t.replaceRange(f.map(h.pos), f.map(p.pos), a ? l.empty : e),
          0 == a && le(t, i, (n ? n.isInline : r && r.isTextblock) ? -1 : 1);
      }
    }),
    (ee.prototype.replaceWith = function (t, e) {
      for (var n = t.steps.length, r = this.ranges, o = 0; o < r.length; o++) {
        var i = r[o],
          s = i.$from,
          a = i.$to,
          c = t.mapping.slice(n),
          h = c.map(s.pos),
          p = c.map(a.pos);
        o
          ? t.deleteRange(h, p)
          : (t.replaceRangeWith(h, p, e), le(t, n, e.isInline ? -1 : 1));
      }
    }),
    (ee.findFrom = function (t, e, n) {
      var r = t.parent.inlineContent
        ? new oe(t)
        : pe(t.node(0), t.parent, t.pos, t.index(), e, n);
      if (r) return r;
      for (var o = t.depth - 1; o >= 0; o--) {
        var i =
          e < 0
            ? pe(t.node(0), t.node(o), t.before(o + 1), t.index(o), e, n)
            : pe(t.node(0), t.node(o), t.after(o + 1), t.index(o) + 1, e, n);
        if (i) return i;
      }
    }),
    (ee.near = function (t, e) {
      return (
        void 0 === e && (e = 1),
        this.findFrom(t, e) || this.findFrom(t, -e) || new ce(t.node(0))
      );
    }),
    (ee.atStart = function (t) {
      return pe(t, t, 0, 0, 1) || new ce(t);
    }),
    (ee.atEnd = function (t) {
      return pe(t, t, t.content.size, t.childCount, -1) || new ce(t);
    }),
    (ee.fromJSON = function (t, e) {
      if (!e || !e.type)
        throw new RangeError('Invalid input for Selection.fromJSON');
      var n = te[e.type];
      if (!n) throw new RangeError('No selection type ' + e.type + ' defined');
      return n.fromJSON(t, e);
    }),
    (ee.jsonID = function (t, e) {
      if (t in te)
        throw new RangeError('Duplicate use of selection JSON ID ' + t);
      return (te[t] = e), (e.prototype.jsonID = t), e;
    }),
    (ee.prototype.getBookmark = function () {
      return oe.between(this.$anchor, this.$head).getBookmark();
    }),
    Object.defineProperties(ee.prototype, ne),
    (ee.prototype.visible = !0);
  var re = function (t, e) {
      (this.$from = t), (this.$to = e);
    },
    oe = (function (t) {
      function e(e, n) {
        void 0 === n && (n = e), t.call(this, e, n);
      }
      t && (e.__proto__ = t),
        (e.prototype = Object.create(t && t.prototype)),
        (e.prototype.constructor = e);
      var n = { $cursor: { configurable: !0 } };
      return (
        (n.$cursor.get = function () {
          return this.$anchor.pos == this.$head.pos ? this.$head : null;
        }),
        (e.prototype.map = function (n, r) {
          var o = n.resolve(r.map(this.head));
          if (!o.parent.inlineContent) return t.near(o);
          var i = n.resolve(r.map(this.anchor));
          return new e(i.parent.inlineContent ? i : o, o);
        }),
        (e.prototype.replace = function (e, n) {
          if (
            (void 0 === n && (n = l.empty),
            t.prototype.replace.call(this, e, n),
            n == l.empty)
          ) {
            var r = this.$from.marksAcross(this.$to);
            r && e.ensureMarks(r);
          }
        }),
        (e.prototype.eq = function (t) {
          return (
            t instanceof e && t.anchor == this.anchor && t.head == this.head
          );
        }),
        (e.prototype.getBookmark = function () {
          return new ie(this.anchor, this.head);
        }),
        (e.prototype.toJSON = function () {
          return { type: 'text', anchor: this.anchor, head: this.head };
        }),
        (e.fromJSON = function (t, n) {
          if ('number' != typeof n.anchor || 'number' != typeof n.head)
            throw new RangeError('Invalid input for TextSelection.fromJSON');
          return new e(t.resolve(n.anchor), t.resolve(n.head));
        }),
        (e.create = function (t, e, n) {
          void 0 === n && (n = e);
          var r = t.resolve(e);
          return new this(r, n == e ? r : t.resolve(n));
        }),
        (e.between = function (n, r, o) {
          var i = n.pos - r.pos;
          if (((o && !i) || (o = i >= 0 ? 1 : -1), !r.parent.inlineContent)) {
            var s = t.findFrom(r, o, !0) || t.findFrom(r, -o, !0);
            if (!s) return t.near(r, o);
            r = s.$head;
          }
          return (
            n.parent.inlineContent ||
              ((0 == i ||
                (n = (t.findFrom(n, -o, !0) || t.findFrom(n, o, !0)).$anchor)
                  .pos <
                  r.pos !=
                  i < 0) &&
                (n = r)),
            new e(n, r)
          );
        }),
        Object.defineProperties(e.prototype, n),
        e
      );
    })(ee);
  ee.jsonID('text', oe);
  var ie = function (t, e) {
    (this.anchor = t), (this.head = e);
  };
  (ie.prototype.map = function (t) {
    return new ie(t.map(this.anchor), t.map(this.head));
  }),
    (ie.prototype.resolve = function (t) {
      return oe.between(t.resolve(this.anchor), t.resolve(this.head));
    });
  var se = (function (t) {
    function e(e) {
      var n = e.nodeAfter,
        r = e.node(0).resolve(e.pos + n.nodeSize);
      t.call(this, e, r), (this.node = n);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.map = function (n, r) {
        var o = r.mapResult(this.anchor),
          i = o.deleted,
          s = o.pos,
          a = n.resolve(s);
        return i ? t.near(a) : new e(a);
      }),
      (e.prototype.content = function () {
        return new l(o.from(this.node), 0, 0);
      }),
      (e.prototype.eq = function (t) {
        return t instanceof e && t.anchor == this.anchor;
      }),
      (e.prototype.toJSON = function () {
        return { type: 'node', anchor: this.anchor };
      }),
      (e.prototype.getBookmark = function () {
        return new ae(this.anchor);
      }),
      (e.fromJSON = function (t, n) {
        if ('number' != typeof n.anchor)
          throw new RangeError('Invalid input for NodeSelection.fromJSON');
        return new e(t.resolve(n.anchor));
      }),
      (e.create = function (t, e) {
        return new this(t.resolve(e));
      }),
      (e.isSelectable = function (t) {
        return !t.isText && !1 !== t.type.spec.selectable;
      }),
      e
    );
  })(ee);
  (se.prototype.visible = !1), ee.jsonID('node', se);
  var ae = function (t) {
    this.anchor = t;
  };
  (ae.prototype.map = function (t) {
    var e = t.mapResult(this.anchor),
      n = e.deleted,
      r = e.pos;
    return n ? new ie(r, r) : new ae(r);
  }),
    (ae.prototype.resolve = function (t) {
      var e = t.resolve(this.anchor),
        n = e.nodeAfter;
      return n && se.isSelectable(n) ? new se(e) : ee.near(e);
    });
  var ce = (function (t) {
    function e(e) {
      t.call(this, e.resolve(0), e.resolve(e.content.size));
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.replace = function (e, n) {
        if ((void 0 === n && (n = l.empty), n == l.empty)) {
          e.delete(0, e.doc.content.size);
          var r = t.atStart(e.doc);
          r.eq(e.selection) || e.setSelection(r);
        } else t.prototype.replace.call(this, e, n);
      }),
      (e.prototype.toJSON = function () {
        return { type: 'all' };
      }),
      (e.fromJSON = function (t) {
        return new e(t);
      }),
      (e.prototype.map = function (t) {
        return new e(t);
      }),
      (e.prototype.eq = function (t) {
        return t instanceof e;
      }),
      (e.prototype.getBookmark = function () {
        return he;
      }),
      e
    );
  })(ee);
  ee.jsonID('all', ce);
  var he = {
    map: function () {
      return this;
    },
    resolve: function (t) {
      return new ce(t);
    },
  };
  function pe(t, e, n, r, o, i) {
    if (e.inlineContent) return oe.create(t, n);
    for (
      var s = r - (o > 0 ? 0 : 1);
      o > 0 ? s < e.childCount : s >= 0;
      s += o
    ) {
      var a = e.child(s);
      if (a.isAtom) {
        if (!i && se.isSelectable(a))
          return se.create(t, n - (o < 0 ? a.nodeSize : 0));
      } else {
        var c = pe(t, a, n + o, o < 0 ? a.childCount : 0, o, i);
        if (c) return c;
      }
      n += a.nodeSize * o;
    }
  }
  function le(t, e, n) {
    var r = t.steps.length - 1;
    if (!(r < e)) {
      var o,
        i = t.steps[r];
      (i instanceof Vt || i instanceof _t) &&
        (t.mapping.maps[r].forEach(function (t, e, n, r) {
          null == o && (o = r);
        }),
        t.setSelection(ee.near(t.doc.resolve(o), n)));
    }
  }
  var fe = (function (t) {
    function e(e) {
      t.call(this, e.doc),
        (this.time = Date.now()),
        (this.curSelection = e.selection),
        (this.curSelectionFor = 0),
        (this.storedMarks = e.storedMarks),
        (this.updated = 0),
        (this.meta = Object.create(null));
    }
    t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e);
    var n = {
      selection: { configurable: !0 },
      selectionSet: { configurable: !0 },
      storedMarksSet: { configurable: !0 },
      isGeneric: { configurable: !0 },
      scrolledIntoView: { configurable: !0 },
    };
    return (
      (n.selection.get = function () {
        return (
          this.curSelectionFor < this.steps.length &&
            ((this.curSelection = this.curSelection.map(
              this.doc,
              this.mapping.slice(this.curSelectionFor),
            )),
            (this.curSelectionFor = this.steps.length)),
          this.curSelection
        );
      }),
      (e.prototype.setSelection = function (t) {
        if (t.$from.doc != this.doc)
          throw new RangeError(
            'Selection passed to setSelection must point at the current document',
          );
        return (
          (this.curSelection = t),
          (this.curSelectionFor = this.steps.length),
          (this.updated = -3 & (1 | this.updated)),
          (this.storedMarks = null),
          this
        );
      }),
      (n.selectionSet.get = function () {
        return (1 & this.updated) > 0;
      }),
      (e.prototype.setStoredMarks = function (t) {
        return (this.storedMarks = t), (this.updated |= 2), this;
      }),
      (e.prototype.ensureMarks = function (t) {
        return (
          h.sameSet(this.storedMarks || this.selection.$from.marks(), t) ||
            this.setStoredMarks(t),
          this
        );
      }),
      (e.prototype.addStoredMark = function (t) {
        return this.ensureMarks(
          t.addToSet(this.storedMarks || this.selection.$head.marks()),
        );
      }),
      (e.prototype.removeStoredMark = function (t) {
        return this.ensureMarks(
          t.removeFromSet(this.storedMarks || this.selection.$head.marks()),
        );
      }),
      (n.storedMarksSet.get = function () {
        return (2 & this.updated) > 0;
      }),
      (e.prototype.addStep = function (e, n) {
        t.prototype.addStep.call(this, e, n),
          (this.updated = -3 & this.updated),
          (this.storedMarks = null);
      }),
      (e.prototype.setTime = function (t) {
        return (this.time = t), this;
      }),
      (e.prototype.replaceSelection = function (t) {
        return this.selection.replace(this, t), this;
      }),
      (e.prototype.replaceSelectionWith = function (t, e) {
        var n = this.selection;
        return (
          !1 !== e &&
            (t = t.mark(
              this.storedMarks ||
                (n.empty
                  ? n.$from.marks()
                  : n.$from.marksAcross(n.$to) || h.none),
            )),
          n.replaceWith(this, t),
          this
        );
      }),
      (e.prototype.deleteSelection = function () {
        return this.selection.replace(this), this;
      }),
      (e.prototype.insertText = function (t, e, n) {
        void 0 === n && (n = e);
        var r = this.doc.type.schema;
        if (null == e)
          return t
            ? this.replaceSelectionWith(r.text(t), !0)
            : this.deleteSelection();
        if (!t) return this.deleteRange(e, n);
        var o = this.storedMarks;
        if (!o) {
          var i = this.doc.resolve(e);
          o = n == e ? i.marks() : i.marksAcross(this.doc.resolve(n));
        }
        return (
          this.replaceRangeWith(e, n, r.text(t, o)),
          this.selection.empty ||
            this.setSelection(ee.near(this.selection.$to)),
          this
        );
      }),
      (e.prototype.setMeta = function (t, e) {
        return (this.meta['string' == typeof t ? t : t.key] = e), this;
      }),
      (e.prototype.getMeta = function (t) {
        return this.meta['string' == typeof t ? t : t.key];
      }),
      (n.isGeneric.get = function () {
        for (var t in this.meta) return !1;
        return !0;
      }),
      (e.prototype.scrollIntoView = function () {
        return (this.updated |= 4), this;
      }),
      (n.scrolledIntoView.get = function () {
        return (4 & this.updated) > 0;
      }),
      Object.defineProperties(e.prototype, n),
      e
    );
  })(Rt);
  function ue(t, e) {
    return e && t ? t.bind(e) : t;
  }
  var de = function (t, e, n) {
      (this.name = t),
        (this.init = ue(e.init, n)),
        (this.apply = ue(e.apply, n));
    },
    me = [
      new de('doc', {
        init: function (t) {
          return t.doc || t.schema.topNodeType.createAndFill();
        },
        apply: function (t) {
          return t.doc;
        },
      }),
      new de('selection', {
        init: function (t, e) {
          return t.selection || ee.atStart(e.doc);
        },
        apply: function (t) {
          return t.selection;
        },
      }),
      new de('storedMarks', {
        init: function (t) {
          return t.storedMarks || null;
        },
        apply: function (t, e, n, r) {
          return r.selection.$cursor ? t.storedMarks : null;
        },
      }),
      new de('scrollToSelection', {
        init: function () {
          return 0;
        },
        apply: function (t, e) {
          return t.scrolledIntoView ? e + 1 : e;
        },
      }),
    ],
    ve = function (t, e) {
      var n = this;
      (this.schema = t),
        (this.fields = me.concat()),
        (this.plugins = []),
        (this.pluginsByKey = Object.create(null)),
        e &&
          e.forEach(function (t) {
            if (n.pluginsByKey[t.key])
              throw new RangeError(
                'Adding different instances of a keyed plugin (' + t.key + ')',
              );
            n.plugins.push(t),
              (n.pluginsByKey[t.key] = t),
              t.spec.state && n.fields.push(new de(t.key, t.spec.state, t));
          });
    },
    ge = function (t) {
      this.config = t;
    },
    ye = {
      schema: { configurable: !0 },
      plugins: { configurable: !0 },
      tr: { configurable: !0 },
    };
  (ye.schema.get = function () {
    return this.config.schema;
  }),
    (ye.plugins.get = function () {
      return this.config.plugins;
    }),
    (ge.prototype.apply = function (t) {
      return this.applyTransaction(t).state;
    }),
    (ge.prototype.filterTransaction = function (t, e) {
      void 0 === e && (e = -1);
      for (var n = 0; n < this.config.plugins.length; n++)
        if (n != e) {
          var r = this.config.plugins[n];
          if (
            r.spec.filterTransaction &&
            !r.spec.filterTransaction.call(r, t, this)
          )
            return !1;
        }
      return !0;
    }),
    (ge.prototype.applyTransaction = function (t) {
      if (!this.filterTransaction(t)) return { state: this, transactions: [] };
      for (var e = [t], n = this.applyInner(t), r = null; ; ) {
        for (var o = !1, i = 0; i < this.config.plugins.length; i++) {
          var s = this.config.plugins[i];
          if (s.spec.appendTransaction) {
            var a = r ? r[i].n : 0,
              c = r ? r[i].state : this,
              h =
                a < e.length &&
                s.spec.appendTransaction.call(s, a ? e.slice(a) : e, c, n);
            if (h && n.filterTransaction(h, i)) {
              if ((h.setMeta('appendedTransaction', t), !r)) {
                r = [];
                for (var p = 0; p < this.config.plugins.length; p++)
                  r.push(
                    p < i ? { state: n, n: e.length } : { state: this, n: 0 },
                  );
              }
              e.push(h), (n = n.applyInner(h)), (o = !0);
            }
            r && (r[i] = { state: n, n: e.length });
          }
        }
        if (!o) return { state: n, transactions: e };
      }
    }),
    (ge.prototype.applyInner = function (t) {
      if (!t.before.eq(this.doc))
        throw new RangeError('Applying a mismatched transaction');
      for (
        var e = new ge(this.config), n = this.config.fields, r = 0;
        r < n.length;
        r++
      ) {
        var o = n[r];
        e[o.name] = o.apply(t, this[o.name], this, e);
      }
      for (var i = 0; i < we.length; i++) we[i](this, t, e);
      return e;
    }),
    (ye.tr.get = function () {
      return new fe(this);
    }),
    (ge.create = function (t) {
      for (
        var e = new ve(t.doc ? t.doc.type.schema : t.schema, t.plugins),
          n = new ge(e),
          r = 0;
        r < e.fields.length;
        r++
      )
        n[e.fields[r].name] = e.fields[r].init(t, n);
      return n;
    }),
    (ge.prototype.reconfigure = function (t) {
      for (
        var e = new ve(this.schema, t.plugins),
          n = e.fields,
          r = new ge(e),
          o = 0;
        o < n.length;
        o++
      ) {
        var i = n[o].name;
        r[i] = this.hasOwnProperty(i) ? this[i] : n[o].init(t, r);
      }
      return r;
    }),
    (ge.prototype.toJSON = function (t) {
      var e = { doc: this.doc.toJSON(), selection: this.selection.toJSON() };
      if (
        (this.storedMarks &&
          (e.storedMarks = this.storedMarks.map(function (t) {
            return t.toJSON();
          })),
        t && 'object' == typeof t)
      )
        for (var n in t) {
          if ('doc' == n || 'selection' == n)
            throw new RangeError(
              'The JSON fields `doc` and `selection` are reserved',
            );
          var r = t[n],
            o = r.spec.state;
          o && o.toJSON && (e[n] = o.toJSON.call(r, this[r.key]));
        }
      return e;
    }),
    (ge.fromJSON = function (t, e, n) {
      if (!e) throw new RangeError('Invalid input for EditorState.fromJSON');
      if (!t.schema)
        throw new RangeError("Required config field 'schema' missing");
      var r = new ve(t.schema, t.plugins),
        o = new ge(r);
      return (
        r.fields.forEach(function (r) {
          if ('doc' == r.name) o.doc = R.fromJSON(t.schema, e.doc);
          else if ('selection' == r.name)
            o.selection = ee.fromJSON(o.doc, e.selection);
          else if ('storedMarks' == r.name)
            e.storedMarks &&
              (o.storedMarks = e.storedMarks.map(t.schema.markFromJSON));
          else {
            if (n)
              for (var i in n) {
                var s = n[i],
                  a = s.spec.state;
                if (
                  s.key == r.name &&
                  a &&
                  a.fromJSON &&
                  Object.prototype.hasOwnProperty.call(e, i)
                )
                  return void (o[r.name] = a.fromJSON.call(s, t, e[i], o));
              }
            o[r.name] = r.init(t, o);
          }
        }),
        o
      );
    }),
    (ge.addApplyListener = function (t) {
      we.push(t);
    }),
    (ge.removeApplyListener = function (t) {
      var e = we.indexOf(t);
      e > -1 && we.splice(e, 1);
    }),
    Object.defineProperties(ge.prototype, ye);
  var we = [];
  function be(t, e, n) {
    for (var r in t) {
      var o = t[r];
      o instanceof Function
        ? (o = o.bind(e))
        : 'handleDOMEvents' == r && (o = be(o, e, {})),
        (n[r] = o);
    }
    return n;
  }
  (function (t) {
    (this.props = {}),
      t.props && be(t.props, this, this.props),
      (this.spec = t),
      (this.key = t.key ? t.key.key : Se('plugin'));
  }.prototype.getState = function (t) {
    return t[this.key];
  });
  var ke = Object.create(null);
  function Se(t) {
    return t in ke ? t + '$' + ++ke[t] : ((ke[t] = 0), t + '$');
  }
  var xe = function (t) {
    void 0 === t && (t = 'key'), (this.key = Se(t));
  };
  (xe.prototype.get = function (t) {
    return t.config.pluginsByKey[this.key];
  }),
    (xe.prototype.getState = function (t) {
      return t[this.key];
    });
  var Oe = {};
  if ('undefined' != typeof navigator && 'undefined' != typeof document) {
    var Me = /Edge\/(\d+)/.exec(navigator.userAgent),
      Ce = /MSIE \d/.test(navigator.userAgent),
      Ne = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
    Oe.mac = /Mac/.test(navigator.platform);
    var De = (Oe.ie = !!(Ce || Ne || Me));
    (Oe.ie_version = Ce
      ? document.documentMode || 6
      : Ne
      ? +Ne[1]
      : Me
      ? +Me[1]
      : null),
      (Oe.gecko = !De && /gecko\/(\d+)/i.test(navigator.userAgent)),
      (Oe.gecko_version =
        Oe.gecko && +(/Firefox\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1]);
    var Te = !De && /Chrome\/(\d+)/.exec(navigator.userAgent);
    (Oe.chrome = !!Te),
      (Oe.chrome_version = Te && +Te[1]),
      (Oe.safari = !De && /Apple Computer/.test(navigator.vendor)),
      (Oe.ios =
        Oe.safari &&
        (/Mobile\/\w+/.test(navigator.userAgent) ||
          navigator.maxTouchPoints > 2)),
      (Oe.android = /Android \d/.test(navigator.userAgent)),
      (Oe.webkit = 'webkitFontSmoothing' in document.documentElement.style),
      (Oe.webkit_version =
        Oe.webkit &&
        +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1]);
  }
  var Ee = function (t) {
      for (var e = 0; ; e++) if (!(t = t.previousSibling)) return e;
    },
    Ae = function (t) {
      var e = t.assignedSlot || t.parentNode;
      return e && 11 == e.nodeType ? e.host : e;
    },
    Re = null,
    ze = function (t, e, n) {
      var r = Re || (Re = document.createRange());
      return (
        r.setEnd(t, null == n ? t.nodeValue.length : n),
        r.setStart(t, e || 0),
        r
      );
    },
    Pe = function (t, e, n, r) {
      return n && (Be(t, e, n, r, -1) || Be(t, e, n, r, 1));
    },
    Ie = /^(img|br|input|textarea|hr)$/i;
  function Be(t, e, n, r, o) {
    for (;;) {
      if (t == n && e == r) return !0;
      if (e == (o < 0 ? 0 : Fe(t))) {
        var i = t.parentNode;
        if (
          1 != i.nodeType ||
          Ve(t) ||
          Ie.test(t.nodeName) ||
          'false' == t.contentEditable
        )
          return !1;
        (e = Ee(t) + (o < 0 ? 0 : 1)), (t = i);
      } else {
        if (1 != t.nodeType) return !1;
        if ('false' == (t = t.childNodes[e + (o < 0 ? -1 : 0)]).contentEditable)
          return !1;
        e = o < 0 ? Fe(t) : 0;
      }
    }
  }
  function Fe(t) {
    return 3 == t.nodeType ? t.nodeValue.length : t.childNodes.length;
  }
  function Ve(t) {
    for (var e, n = t; n && !(e = n.pmViewDesc); n = n.parentNode);
    return e && e.node && e.node.isBlock && (e.dom == t || e.contentDOM == t);
  }
  var _e = function (t) {
    var e = t.isCollapsed;
    return (
      e && Oe.chrome && t.rangeCount && !t.getRangeAt(0).collapsed && (e = !1),
      e
    );
  };
  function $e(t, e) {
    var n = document.createEvent('Event');
    return (
      n.initEvent('keydown', !0, !0), (n.keyCode = t), (n.key = n.code = e), n
    );
  }
  function je(t) {
    return {
      left: 0,
      right: t.documentElement.clientWidth,
      top: 0,
      bottom: t.documentElement.clientHeight,
    };
  }
  function Le(t, e) {
    return 'number' == typeof t ? t : t[e];
  }
  function Je(t) {
    var e = t.getBoundingClientRect(),
      n = e.width / t.offsetWidth || 1,
      r = e.height / t.offsetHeight || 1;
    return {
      left: e.left,
      right: e.left + t.clientWidth * n,
      top: e.top,
      bottom: e.top + t.clientHeight * r,
    };
  }
  function qe(t, e, n) {
    for (
      var r = t.someProp('scrollThreshold') || 0,
        o = t.someProp('scrollMargin') || 5,
        i = t.dom.ownerDocument,
        s = n || t.dom;
      s;
      s = Ae(s)
    )
      if (1 == s.nodeType) {
        var a = s == i.body || 1 != s.nodeType,
          c = a ? je(i) : Je(s),
          h = 0,
          p = 0;
        if (
          (e.top < c.top + Le(r, 'top')
            ? (p = -(c.top - e.top + Le(o, 'top')))
            : e.bottom > c.bottom - Le(r, 'bottom') &&
              (p = e.bottom - c.bottom + Le(o, 'bottom')),
          e.left < c.left + Le(r, 'left')
            ? (h = -(c.left - e.left + Le(o, 'left')))
            : e.right > c.right - Le(r, 'right') &&
              (h = e.right - c.right + Le(o, 'right')),
          h || p)
        )
          if (a) i.defaultView.scrollBy(h, p);
          else {
            var l = s.scrollLeft,
              f = s.scrollTop;
            p && (s.scrollTop += p), h && (s.scrollLeft += h);
            var u = s.scrollLeft - l,
              d = s.scrollTop - f;
            e = {
              left: e.left - u,
              top: e.top - d,
              right: e.right - u,
              bottom: e.bottom - d,
            };
          }
        if (a) break;
      }
  }
  function We(t) {
    for (
      var e = [], n = t.ownerDocument;
      t && (e.push({ dom: t, top: t.scrollTop, left: t.scrollLeft }), t != n);
      t = Ae(t)
    );
    return e;
  }
  function Ke(t, e) {
    for (var n = 0; n < t.length; n++) {
      var r = t[n],
        o = r.dom,
        i = r.top,
        s = r.left;
      o.scrollTop != i + e && (o.scrollTop = i + e),
        o.scrollLeft != s && (o.scrollLeft = s);
    }
  }
  var He = null;
  function Ue(t, e) {
    for (
      var n, r, o = 2e8, i = 0, s = e.top, a = e.top, c = t.firstChild, h = 0;
      c;
      c = c.nextSibling, h++
    ) {
      var p = void 0;
      if (1 == c.nodeType) p = c.getClientRects();
      else {
        if (3 != c.nodeType) continue;
        p = ze(c).getClientRects();
      }
      for (var l = 0; l < p.length; l++) {
        var f = p[l];
        if (f.top <= s && f.bottom >= a) {
          (s = Math.max(f.bottom, s)), (a = Math.min(f.top, a));
          var u =
            f.left > e.left
              ? f.left - e.left
              : f.right < e.left
              ? e.left - f.right
              : 0;
          if (u < o) {
            (n = c),
              (o = u),
              (r =
                u && 3 == n.nodeType
                  ? { left: f.right < e.left ? f.right : f.left, top: e.top }
                  : e),
              1 == c.nodeType &&
                u &&
                (i = h + (e.left >= (f.left + f.right) / 2 ? 1 : 0));
            continue;
          }
        }
        !n &&
          ((e.left >= f.right && e.top >= f.top) ||
            (e.left >= f.left && e.top >= f.bottom)) &&
          (i = h + 1);
      }
    }
    return n && 3 == n.nodeType
      ? (function (t, e) {
          for (
            var n = t.nodeValue.length, r = document.createRange(), o = 0;
            o < n;
            o++
          ) {
            r.setEnd(t, o + 1), r.setStart(t, o);
            var i = Qe(r, 1);
            if (i.top != i.bottom && Ge(e, i))
              return {
                node: t,
                offset: o + (e.left >= (i.left + i.right) / 2 ? 1 : 0),
              };
          }
          return { node: t, offset: 0 };
        })(n, r)
      : !n || (o && 1 == n.nodeType)
      ? { node: t, offset: i }
      : Ue(n, r);
  }
  function Ge(t, e) {
    return (
      t.left >= e.left - 1 &&
      t.left <= e.right + 1 &&
      t.top >= e.top - 1 &&
      t.top <= e.bottom + 1
    );
  }
  function Xe(t, e, n) {
    var r = t.childNodes.length;
    if (r && n.top < n.bottom)
      for (
        var o = Math.max(
            0,
            Math.min(
              r - 1,
              Math.floor((r * (e.top - n.top)) / (n.bottom - n.top)) - 2,
            ),
          ),
          i = o;
        ;

      ) {
        var s = t.childNodes[i];
        if (1 == s.nodeType)
          for (var a = s.getClientRects(), c = 0; c < a.length; c++) {
            var h = a[c];
            if (Ge(e, h)) return Xe(s, e, h);
          }
        if ((i = (i + 1) % r) == o) break;
      }
    return t;
  }
  function Ye(t, e) {
    var n,
      r,
      o,
      i,
      s = t.root;
    if (s.caretPositionFromPoint)
      try {
        var a = s.caretPositionFromPoint(e.left, e.top);
        a && ((o = (n = a).offsetNode), (i = n.offset));
      } catch (t) {}
    if (!o && s.caretRangeFromPoint) {
      var c = s.caretRangeFromPoint(e.left, e.top);
      c && ((o = (r = c).startContainer), (i = r.startOffset));
    }
    var h,
      p = s.elementFromPoint(e.left, e.top + 1);
    if (!p || !t.dom.contains(1 != p.nodeType ? p.parentNode : p)) {
      var l = t.dom.getBoundingClientRect();
      if (!Ge(e, l)) return null;
      if (!(p = Xe(t.dom, e, l))) return null;
    }
    if (
      (Oe.safari && p.draggable && (o = i = null),
      (p = (function (t, e) {
        var n = t.parentNode;
        return n &&
          /^li$/i.test(n.nodeName) &&
          e.left < t.getBoundingClientRect().left
          ? n
          : t;
      })(p, e)),
      o)
    ) {
      if (
        Oe.gecko &&
        1 == o.nodeType &&
        (i = Math.min(i, o.childNodes.length)) < o.childNodes.length
      ) {
        var f,
          u = o.childNodes[i];
        'IMG' == u.nodeName &&
          (f = u.getBoundingClientRect()).right <= e.left &&
          f.bottom > e.top &&
          i++;
      }
      o == t.dom &&
      i == o.childNodes.length - 1 &&
      1 == o.lastChild.nodeType &&
      e.top > o.lastChild.getBoundingClientRect().bottom
        ? (h = t.state.doc.content.size)
        : (0 != i && 1 == o.nodeType && 'BR' == o.childNodes[i - 1].nodeName) ||
          (h = (function (t, e, n, r) {
            for (var o = -1, i = e; i != t.dom; ) {
              var s = t.docView.nearestDesc(i, !0);
              if (!s) return null;
              if (s.node.isBlock && s.parent) {
                var a = s.dom.getBoundingClientRect();
                if (a.left > r.left || a.top > r.top) o = s.posBefore;
                else {
                  if (!(a.right < r.left || a.bottom < r.top)) break;
                  o = s.posAfter;
                }
              }
              i = s.dom.parentNode;
            }
            return o > -1 ? o : t.docView.posFromDOM(e, n);
          })(t, o, i, e));
    }
    null == h &&
      (h = (function (t, e, n) {
        var r = Ue(e, n),
          o = r.node,
          i = r.offset,
          s = -1;
        if (1 == o.nodeType && !o.firstChild) {
          var a = o.getBoundingClientRect();
          s = a.left != a.right && n.left > (a.left + a.right) / 2 ? 1 : -1;
        }
        return t.docView.posFromDOM(o, i, s);
      })(t, p, e));
    var d = t.docView.nearestDesc(p, !0);
    return { pos: h, inside: d ? d.posAtStart - d.border : -1 };
  }
  function Qe(t, e) {
    var n = t.getClientRects();
    return n.length ? n[e < 0 ? 0 : n.length - 1] : t.getBoundingClientRect();
  }
  var Ze = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
  function tn(t, e, n) {
    var r = t.docView.domFromPos(e, n < 0 ? -1 : 1),
      o = r.node,
      i = r.offset,
      s = Oe.webkit || Oe.gecko;
    if (3 == o.nodeType) {
      if (
        !s ||
        (!Ze.test(o.nodeValue) && (n < 0 ? i : i != o.nodeValue.length))
      ) {
        var a = i,
          c = i,
          h = n < 0 ? 1 : -1;
        return (
          n < 0 && !i
            ? (c++, (h = -1))
            : n >= 0 && i == o.nodeValue.length
            ? (a--, (h = 1))
            : n < 0
            ? a--
            : c++,
          en(Qe(ze(o, a, c), h), h < 0)
        );
      }
      var p = Qe(ze(o, i, i), n);
      if (
        Oe.gecko &&
        i &&
        /\s/.test(o.nodeValue[i - 1]) &&
        i < o.nodeValue.length
      ) {
        var l = Qe(ze(o, i - 1, i - 1), -1);
        if (l.top == p.top) {
          var f = Qe(ze(o, i, i + 1), -1);
          if (f.top != p.top) return en(f, f.left < l.left);
        }
      }
      return p;
    }
    if (!t.state.doc.resolve(e).parent.inlineContent) {
      if (i && (n < 0 || i == Fe(o))) {
        var u = o.childNodes[i - 1];
        if (1 == u.nodeType) return nn(u.getBoundingClientRect(), !1);
      }
      if (i < Fe(o)) {
        var d = o.childNodes[i];
        if (1 == d.nodeType) return nn(d.getBoundingClientRect(), !0);
      }
      return nn(o.getBoundingClientRect(), n >= 0);
    }
    if (i && (n < 0 || i == Fe(o))) {
      var m = o.childNodes[i - 1],
        v =
          3 == m.nodeType
            ? ze(m, Fe(m) - (s ? 0 : 1))
            : 1 != m.nodeType || ('BR' == m.nodeName && m.nextSibling)
            ? null
            : m;
      if (v) return en(Qe(v, 1), !1);
    }
    if (i < Fe(o)) {
      var g = o.childNodes[i],
        y = 3 == g.nodeType ? ze(g, 0, s ? 0 : 1) : 1 == g.nodeType ? g : null;
      if (y) return en(Qe(y, -1), !0);
    }
    return en(Qe(3 == o.nodeType ? ze(o) : o, -n), n >= 0);
  }
  function en(t, e) {
    if (0 == t.width) return t;
    var n = e ? t.left : t.right;
    return { top: t.top, bottom: t.bottom, left: n, right: n };
  }
  function nn(t, e) {
    if (0 == t.height) return t;
    var n = e ? t.top : t.bottom;
    return { top: n, bottom: n, left: t.left, right: t.right };
  }
  function rn(t, e, n) {
    var r = t.state,
      o = t.root.activeElement;
    r != e && t.updateState(e), o != t.dom && t.focus();
    try {
      return n();
    } finally {
      r != e && t.updateState(r), o != t.dom && o && o.focus();
    }
  }
  var on = /[\u0590-\u08ac]/,
    sn = null,
    an = null,
    cn = !1;
  var hn = function (t, e, n, r) {
      (this.parent = t),
        (this.children = e),
        (this.dom = n),
        (n.pmViewDesc = this),
        (this.contentDOM = r),
        (this.dirty = 0);
    },
    pn = {
      beforePosition: { configurable: !0 },
      size: { configurable: !0 },
      border: { configurable: !0 },
      posBefore: { configurable: !0 },
      posAtStart: { configurable: !0 },
      posAfter: { configurable: !0 },
      posAtEnd: { configurable: !0 },
      contentLost: { configurable: !0 },
      domAtom: { configurable: !0 },
    };
  (hn.prototype.matchesWidget = function () {
    return !1;
  }),
    (hn.prototype.matchesMark = function () {
      return !1;
    }),
    (hn.prototype.matchesNode = function () {
      return !1;
    }),
    (hn.prototype.matchesHack = function () {
      return !1;
    }),
    (pn.beforePosition.get = function () {
      return !1;
    }),
    (hn.prototype.parseRule = function () {
      return null;
    }),
    (hn.prototype.stopEvent = function () {
      return !1;
    }),
    (pn.size.get = function () {
      for (var t = 0, e = 0; e < this.children.length; e++)
        t += this.children[e].size;
      return t;
    }),
    (pn.border.get = function () {
      return 0;
    }),
    (hn.prototype.destroy = function () {
      (this.parent = null),
        this.dom.pmViewDesc == this && (this.dom.pmViewDesc = null);
      for (var t = 0; t < this.children.length; t++) this.children[t].destroy();
    }),
    (hn.prototype.posBeforeChild = function (t) {
      for (var e = 0, n = this.posAtStart; e < this.children.length; e++) {
        var r = this.children[e];
        if (r == t) return n;
        n += r.size;
      }
    }),
    (pn.posBefore.get = function () {
      return this.parent.posBeforeChild(this);
    }),
    (pn.posAtStart.get = function () {
      return this.parent ? this.parent.posBeforeChild(this) + this.border : 0;
    }),
    (pn.posAfter.get = function () {
      return this.posBefore + this.size;
    }),
    (pn.posAtEnd.get = function () {
      return this.posAtStart + this.size - 2 * this.border;
    }),
    (hn.prototype.localPosFromDOM = function (t, e, n) {
      if (
        this.contentDOM &&
        this.contentDOM.contains(1 == t.nodeType ? t : t.parentNode)
      ) {
        if (n < 0) {
          var r, o;
          if (t == this.contentDOM) r = t.childNodes[e - 1];
          else {
            for (; t.parentNode != this.contentDOM; ) t = t.parentNode;
            r = t.previousSibling;
          }
          for (; r && (!(o = r.pmViewDesc) || o.parent != this); )
            r = r.previousSibling;
          return r ? this.posBeforeChild(o) + o.size : this.posAtStart;
        }
        var i, s;
        if (t == this.contentDOM) i = t.childNodes[e];
        else {
          for (; t.parentNode != this.contentDOM; ) t = t.parentNode;
          i = t.nextSibling;
        }
        for (; i && (!(s = i.pmViewDesc) || s.parent != this); )
          i = i.nextSibling;
        return i ? this.posBeforeChild(s) : this.posAtEnd;
      }
      var a;
      if (t == this.dom && this.contentDOM) a = e > Ee(this.contentDOM);
      else if (
        this.contentDOM &&
        this.contentDOM != this.dom &&
        this.dom.contains(this.contentDOM)
      )
        a = 2 & t.compareDocumentPosition(this.contentDOM);
      else if (this.dom.firstChild) {
        if (0 == e)
          for (var c = t; ; c = c.parentNode) {
            if (c == this.dom) {
              a = !1;
              break;
            }
            if (c.parentNode.firstChild != c) break;
          }
        if (null == a && e == t.childNodes.length)
          for (var h = t; ; h = h.parentNode) {
            if (h == this.dom) {
              a = !0;
              break;
            }
            if (h.parentNode.lastChild != h) break;
          }
      }
      return (null == a ? n > 0 : a) ? this.posAtEnd : this.posAtStart;
    }),
    (hn.prototype.nearestDesc = function (t, e) {
      for (var n = !0, r = t; r; r = r.parentNode) {
        var o = this.getDesc(r);
        if (o && (!e || o.node)) {
          if (
            !n ||
            !o.nodeDOM ||
            (1 == o.nodeDOM.nodeType
              ? o.nodeDOM.contains(1 == t.nodeType ? t : t.parentNode)
              : o.nodeDOM == t)
          )
            return o;
          n = !1;
        }
      }
    }),
    (hn.prototype.getDesc = function (t) {
      for (var e = t.pmViewDesc, n = e; n; n = n.parent)
        if (n == this) return e;
    }),
    (hn.prototype.posFromDOM = function (t, e, n) {
      for (var r = t; r; r = r.parentNode) {
        var o = this.getDesc(r);
        if (o) return o.localPosFromDOM(t, e, n);
      }
      return -1;
    }),
    (hn.prototype.descAt = function (t) {
      for (var e = 0, n = 0; e < this.children.length; e++) {
        var r = this.children[e],
          o = n + r.size;
        if (n == t && o != n) {
          for (; !r.border && r.children.length; ) r = r.children[0];
          return r;
        }
        if (t < o) return r.descAt(t - n - r.border);
        n = o;
      }
    }),
    (hn.prototype.domFromPos = function (t, e) {
      if (!this.contentDOM) return { node: this.dom, offset: 0 };
      for (var n = 0, r = 0, o = !0; ; r++, o = !1) {
        for (
          ;
          r < this.children.length &&
          (this.children[r].beforePosition ||
            this.children[r].dom.parentNode != this.contentDOM);

        )
          n += this.children[r++].size;
        var i = r == this.children.length ? null : this.children[r];
        if (
          (n == t && (0 == e || !i || !i.size || i.border || (e < 0 && o))) ||
          (i && i.domAtom && t < n + i.size)
        )
          return {
            node: this.contentDOM,
            offset: i ? Ee(i.dom) : this.contentDOM.childNodes.length,
          };
        if (!i) throw new Error('Invalid position ' + t);
        var s = n + i.size;
        if (
          !i.domAtom &&
          (e < 0 && !i.border ? s >= t : s > t) &&
          (s > t ||
            r + 1 >= this.children.length ||
            !this.children[r + 1].beforePosition)
        )
          return i.domFromPos(t - n - i.border, e);
        n = s;
      }
    }),
    (hn.prototype.parseRange = function (t, e, n) {
      if ((void 0 === n && (n = 0), 0 == this.children.length))
        return {
          node: this.contentDOM,
          from: t,
          to: e,
          fromOffset: 0,
          toOffset: this.contentDOM.childNodes.length,
        };
      for (var r = -1, o = -1, i = n, s = 0; ; s++) {
        var a = this.children[s],
          c = i + a.size;
        if (-1 == r && t <= c) {
          var h = i + a.border;
          if (
            t >= h &&
            e <= c - a.border &&
            a.node &&
            a.contentDOM &&
            this.contentDOM.contains(a.contentDOM)
          )
            return a.parseRange(t, e, h);
          t = i;
          for (var p = s; p > 0; p--) {
            var l = this.children[p - 1];
            if (
              l.size &&
              l.dom.parentNode == this.contentDOM &&
              !l.emptyChildAt(1)
            ) {
              r = Ee(l.dom) + 1;
              break;
            }
            t -= l.size;
          }
          -1 == r && (r = 0);
        }
        if (r > -1 && (c > e || s == this.children.length - 1)) {
          e = c;
          for (var f = s + 1; f < this.children.length; f++) {
            var u = this.children[f];
            if (
              u.size &&
              u.dom.parentNode == this.contentDOM &&
              !u.emptyChildAt(-1)
            ) {
              o = Ee(u.dom);
              break;
            }
            e += u.size;
          }
          -1 == o && (o = this.contentDOM.childNodes.length);
          break;
        }
        i = c;
      }
      return {
        node: this.contentDOM,
        from: t,
        to: e,
        fromOffset: r,
        toOffset: o,
      };
    }),
    (hn.prototype.emptyChildAt = function (t) {
      if (this.border || !this.contentDOM || !this.children.length) return !1;
      var e = this.children[t < 0 ? 0 : this.children.length - 1];
      return 0 == e.size || e.emptyChildAt(t);
    }),
    (hn.prototype.domAfterPos = function (t) {
      var e = this.domFromPos(t, 0),
        n = e.node,
        r = e.offset;
      if (1 != n.nodeType || r == n.childNodes.length)
        throw new RangeError('No node after pos ' + t);
      return n.childNodes[r];
    }),
    (hn.prototype.setSelection = function (t, e, n, r) {
      for (
        var o = Math.min(t, e), i = Math.max(t, e), s = 0, a = 0;
        s < this.children.length;
        s++
      ) {
        var c = this.children[s],
          h = a + c.size;
        if (o > a && i < h)
          return c.setSelection(t - a - c.border, e - a - c.border, n, r);
        a = h;
      }
      var p = this.domFromPos(t, t ? -1 : 1),
        l = e == t ? p : this.domFromPos(e, e ? -1 : 1),
        f = n.getSelection(),
        u = !1;
      if ((Oe.gecko || Oe.safari) && t == e) {
        var d = p.node,
          m = p.offset;
        if (3 == d.nodeType)
          (u = m && '\n' == d.nodeValue[m - 1]) &&
            m == d.nodeValue.length &&
            d.nextSibling &&
            'BR' == d.nextSibling.nodeName &&
            (p = l = { node: d.parentNode, offset: Ee(d) + 1 });
        else {
          var v = d.childNodes[m - 1];
          u = v && ('BR' == v.nodeName || 'false' == v.contentEditable);
        }
      }
      if (
        r ||
        (u && Oe.safari) ||
        !Pe(p.node, p.offset, f.anchorNode, f.anchorOffset) ||
        !Pe(l.node, l.offset, f.focusNode, f.focusOffset)
      ) {
        var g = !1;
        if ((f.extend || t == e) && !u) {
          f.collapse(p.node, p.offset);
          try {
            t != e && f.extend(l.node, l.offset), (g = !0);
          } catch (t) {
            if (!(t instanceof DOMException)) throw t;
          }
        }
        if (!g) {
          if (t > e) {
            var y = p;
            (p = l), (l = y);
          }
          var w = document.createRange();
          w.setEnd(l.node, l.offset),
            w.setStart(p.node, p.offset),
            f.removeAllRanges(),
            f.addRange(w);
        }
      }
    }),
    (hn.prototype.ignoreMutation = function (t) {
      return !this.contentDOM && 'selection' != t.type;
    }),
    (pn.contentLost.get = function () {
      return (
        this.contentDOM &&
        this.contentDOM != this.dom &&
        !this.dom.contains(this.contentDOM)
      );
    }),
    (hn.prototype.markDirty = function (t, e) {
      for (var n = 0, r = 0; r < this.children.length; r++) {
        var o = this.children[r],
          i = n + o.size;
        if (n == i ? t <= i && e >= n : t < i && e > n) {
          var s = n + o.border,
            a = i - o.border;
          if (t >= s && e <= a)
            return (
              (this.dirty = t == n || e == i ? 2 : 1),
              void (t != s ||
              e != a ||
              (!o.contentLost && o.dom.parentNode == this.contentDOM)
                ? o.markDirty(t - s, e - s)
                : (o.dirty = 3))
            );
          o.dirty = 3;
        }
        n = i;
      }
      this.dirty = 2;
    }),
    (hn.prototype.markParentsDirty = function () {
      for (var t = 1, e = this.parent; e; e = e.parent, t++) {
        var n = 1 == t ? 2 : 1;
        e.dirty < n && (e.dirty = n);
      }
    }),
    (pn.domAtom.get = function () {
      return !1;
    }),
    Object.defineProperties(hn.prototype, pn);
  var ln = [],
    fn = (function (t) {
      function e(e, n, r, o) {
        var i,
          s = n.type.toDOM;
        if (
          ('function' == typeof s &&
            (s = s(r, function () {
              return i ? (i.parent ? i.parent.posBeforeChild(i) : void 0) : o;
            })),
          !n.type.spec.raw)
        ) {
          if (1 != s.nodeType) {
            var a = document.createElement('span');
            a.appendChild(s), (s = a);
          }
          (s.contentEditable = !1), s.classList.add('ProseMirror-widget');
        }
        t.call(this, e, ln, s, null), (this.widget = n), (i = this);
      }
      t && (e.__proto__ = t),
        (e.prototype = Object.create(t && t.prototype)),
        (e.prototype.constructor = e);
      var n = {
        beforePosition: { configurable: !0 },
        domAtom: { configurable: !0 },
      };
      return (
        (n.beforePosition.get = function () {
          return this.widget.type.side < 0;
        }),
        (e.prototype.matchesWidget = function (t) {
          return 0 == this.dirty && t.type.eq(this.widget.type);
        }),
        (e.prototype.parseRule = function () {
          return { ignore: !0 };
        }),
        (e.prototype.stopEvent = function (t) {
          var e = this.widget.spec.stopEvent;
          return !!e && e(t);
        }),
        (e.prototype.ignoreMutation = function (t) {
          return 'selection' != t.type || this.widget.spec.ignoreSelection;
        }),
        (n.domAtom.get = function () {
          return !0;
        }),
        Object.defineProperties(e.prototype, n),
        e
      );
    })(hn),
    un = (function (t) {
      function e(e, n, r, o) {
        t.call(this, e, ln, n, null), (this.textDOM = r), (this.text = o);
      }
      t && (e.__proto__ = t),
        (e.prototype = Object.create(t && t.prototype)),
        (e.prototype.constructor = e);
      var n = { size: { configurable: !0 } };
      return (
        (n.size.get = function () {
          return this.text.length;
        }),
        (e.prototype.localPosFromDOM = function (t, e) {
          return t != this.textDOM
            ? this.posAtStart + (e ? this.size : 0)
            : this.posAtStart + e;
        }),
        (e.prototype.domFromPos = function (t) {
          return { node: this.textDOM, offset: t };
        }),
        (e.prototype.ignoreMutation = function (t) {
          return 'characterData' === t.type && t.target.nodeValue == t.oldValue;
        }),
        Object.defineProperties(e.prototype, n),
        e
      );
    })(hn),
    dn = (function (t) {
      function e(e, n, r, o) {
        t.call(this, e, [], r, o), (this.mark = n);
      }
      return (
        t && (e.__proto__ = t),
        (e.prototype = Object.create(t && t.prototype)),
        (e.prototype.constructor = e),
        (e.create = function (t, n, r, o) {
          var i = o.nodeViews[n.type.name],
            s = i && i(n, o, r);
          return (
            (s && s.dom) ||
              (s = dt.renderSpec(document, n.type.spec.toDOM(n, r))),
            new e(t, n, s.dom, s.contentDOM || s.dom)
          );
        }),
        (e.prototype.parseRule = function () {
          return {
            mark: this.mark.type.name,
            attrs: this.mark.attrs,
            contentElement: this.contentDOM,
          };
        }),
        (e.prototype.matchesMark = function (t) {
          return 3 != this.dirty && this.mark.eq(t);
        }),
        (e.prototype.markDirty = function (e, n) {
          if ((t.prototype.markDirty.call(this, e, n), 0 != this.dirty)) {
            for (var r = this.parent; !r.node; ) r = r.parent;
            r.dirty < this.dirty && (r.dirty = this.dirty), (this.dirty = 0);
          }
        }),
        (e.prototype.slice = function (t, n, r) {
          var o = e.create(this.parent, this.mark, !0, r),
            i = this.children,
            s = this.size;
          n < s && (i = An(i, n, s, r)), t > 0 && (i = An(i, 0, t, r));
          for (var a = 0; a < i.length; a++) i[a].parent = o;
          return (o.children = i), o;
        }),
        e
      );
    })(hn),
    mn = (function (t) {
      function e(e, n, r, o, i, s, a, c, h) {
        t.call(this, e, n.isLeaf ? ln : [], i, s),
          (this.nodeDOM = a),
          (this.node = n),
          (this.outerDeco = r),
          (this.innerDeco = o),
          s && this.updateChildren(c, h);
      }
      t && (e.__proto__ = t),
        (e.prototype = Object.create(t && t.prototype)),
        (e.prototype.constructor = e);
      var n = {
        size: { configurable: !0 },
        border: { configurable: !0 },
        domAtom: { configurable: !0 },
      };
      return (
        (e.create = function (t, n, r, o, i, s) {
          var a,
            c,
            h = i.nodeViews[n.type.name],
            p =
              h &&
              h(
                n,
                i,
                function () {
                  return c
                    ? c.parent
                      ? c.parent.posBeforeChild(c)
                      : void 0
                    : s;
                },
                r,
                o,
              ),
            l = p && p.dom,
            f = p && p.contentDOM;
          if (n.isText)
            if (l) {
              if (3 != l.nodeType)
                throw new RangeError(
                  'Text must be rendered as a DOM text node',
                );
            } else l = document.createTextNode(n.text);
          else
            l ||
              ((l = (a = dt.renderSpec(document, n.type.spec.toDOM(n))).dom),
              (f = a.contentDOM));
          f ||
            n.isText ||
            'BR' == l.nodeName ||
            (l.hasAttribute('contenteditable') || (l.contentEditable = !1),
            n.type.spec.draggable && (l.draggable = !0));
          var u = l;
          return (
            (l = Cn(l, r, n)),
            p
              ? (c = new wn(t, n, r, o, l, f, u, p, i, s + 1))
              : n.isText
              ? new gn(t, n, r, o, l, u, i)
              : new e(t, n, r, o, l, f, u, i, s + 1)
          );
        }),
        (e.prototype.parseRule = function () {
          var t = this;
          if (this.node.type.spec.reparseInView) return null;
          var e = { node: this.node.type.name, attrs: this.node.attrs };
          return (
            this.node.type.spec.code && (e.preserveWhitespace = 'full'),
            this.contentDOM && !this.contentLost
              ? (e.contentElement = this.contentDOM)
              : (e.getContent = function () {
                  return t.contentDOM ? o.empty : t.node.content;
                }),
            e
          );
        }),
        (e.prototype.matchesNode = function (t, e, n) {
          return (
            0 == this.dirty &&
            t.eq(this.node) &&
            Nn(e, this.outerDeco) &&
            n.eq(this.innerDeco)
          );
        }),
        (n.size.get = function () {
          return this.node.nodeSize;
        }),
        (n.border.get = function () {
          return this.node.isLeaf ? 0 : 1;
        }),
        (e.prototype.updateChildren = function (t, e) {
          var n = this,
            r = this.node.inlineContent,
            o = e,
            i = r && t.composing && this.localCompositionNode(t, e),
            s = new Tn(this, i && i.node);
          !(function (t, e, n, r) {
            var o = e.locals(t),
              i = 0;
            if (0 != o.length)
              for (var s = 0, a = [], c = null, h = 0; ; ) {
                if (s < o.length && o[s].to == i) {
                  for (
                    var p = o[s++], l = void 0;
                    s < o.length && o[s].to == i;

                  )
                    (l || (l = [p])).push(o[s++]);
                  if (l) {
                    l.sort(En);
                    for (var f = 0; f < l.length; f++) n(l[f], h, !!c);
                  } else n(p, h, !!c);
                }
                var u = void 0,
                  d = void 0;
                if (c) (d = -1), (u = c), (c = null);
                else {
                  if (!(h < t.childCount)) break;
                  (d = h), (u = t.child(h++));
                }
                for (var m = 0; m < a.length; m++)
                  a[m].to <= i && a.splice(m--, 1);
                for (; s < o.length && o[s].from <= i && o[s].to > i; )
                  a.push(o[s++]);
                var v = i + u.nodeSize;
                if (u.isText) {
                  var g = v;
                  s < o.length && o[s].from < g && (g = o[s].from);
                  for (var y = 0; y < a.length; y++)
                    a[y].to < g && (g = a[y].to);
                  g < v &&
                    ((c = u.cut(g - i)),
                    (u = u.cut(0, g - i)),
                    (v = g),
                    (d = -1));
                }
                r(
                  u,
                  a.length
                    ? u.isInline && !u.isLeaf
                      ? a.filter(function (t) {
                          return !t.inline;
                        })
                      : a.slice()
                    : ln,
                  e.forChild(i, u),
                  d,
                ),
                  (i = v);
              }
            else
              for (var w = 0; w < t.childCount; w++) {
                var b = t.child(w);
                r(b, o, e.forChild(i, b), w), (i += b.nodeSize);
              }
          })(
            this.node,
            this.innerDeco,
            function (e, i, a) {
              e.spec.marks
                ? s.syncToMarks(e.spec.marks, r, t)
                : e.type.side >= 0 &&
                  !a &&
                  s.syncToMarks(
                    i == n.node.childCount ? h.none : n.node.child(i).marks,
                    r,
                    t,
                  ),
                s.placeWidget(e, t, o);
            },
            function (e, n, i, a) {
              s.syncToMarks(e.marks, r, t),
                s.findNodeMatch(e, n, i, a) ||
                  s.updateNextNode(e, n, i, t, a) ||
                  s.addNode(e, n, i, t, o),
                (o += e.nodeSize);
            },
          ),
            s.syncToMarks(ln, r, t),
            this.node.isTextblock && s.addTextblockHacks(),
            s.destroyRest(),
            (s.changed || 2 == this.dirty) &&
              (i && this.protectLocalComposition(t, i),
              bn(this.contentDOM, this.children, t),
              Oe.ios &&
                (function (t) {
                  if ('UL' == t.nodeName || 'OL' == t.nodeName) {
                    var e = t.style.cssText;
                    (t.style.cssText = e + '; list-style: square !important'),
                      window.getComputedStyle(t).listStyle,
                      (t.style.cssText = e);
                  }
                })(this.dom));
        }),
        (e.prototype.localCompositionNode = function (t, e) {
          var n = t.state.selection,
            r = n.from,
            o = n.to;
          if (
            !(
              !(t.state.selection instanceof oe) ||
              r < e ||
              o > e + this.node.content.size
            )
          ) {
            var i = t.root.getSelection(),
              s = (function (t, e) {
                for (;;) {
                  if (3 == t.nodeType) return t;
                  if (1 == t.nodeType && e > 0) {
                    if (
                      t.childNodes.length > e &&
                      3 == t.childNodes[e].nodeType
                    )
                      return t.childNodes[e];
                    e = Fe((t = t.childNodes[e - 1]));
                  } else {
                    if (!(1 == t.nodeType && e < t.childNodes.length))
                      return null;
                    (t = t.childNodes[e]), (e = 0);
                  }
                }
              })(i.focusNode, i.focusOffset);
            if (s && this.dom.contains(s.parentNode)) {
              var a = s.nodeValue,
                c = (function (t, e, n, r) {
                  for (var o = 0, i = 0; o < t.childCount && i <= r; ) {
                    var s = t.child(o++),
                      a = i;
                    if (((i += s.nodeSize), s.isText)) {
                      for (var c = s.text; o < t.childCount; ) {
                        var h = t.child(o++);
                        if (((i += h.nodeSize), !h.isText)) break;
                        c += h.text;
                      }
                      if (i >= n) {
                        var p = c.lastIndexOf(e, r - a);
                        if (p >= 0 && p + e.length + a >= n) return a + p;
                      }
                    }
                  }
                  return -1;
                })(this.node.content, a, r - e, o - e);
              return c < 0 ? null : { node: s, pos: c, text: a };
            }
          }
        }),
        (e.prototype.protectLocalComposition = function (t, e) {
          var n = e.node,
            r = e.pos,
            o = e.text;
          if (!this.getDesc(n)) {
            for (var i = n; i.parentNode != this.contentDOM; i = i.parentNode) {
              for (; i.previousSibling; )
                i.parentNode.removeChild(i.previousSibling);
              for (; i.nextSibling; ) i.parentNode.removeChild(i.nextSibling);
              i.pmViewDesc && (i.pmViewDesc = null);
            }
            var s = new un(this, i, n, o);
            t.compositionNodes.push(s),
              (this.children = An(this.children, r, r + o.length, t, s));
          }
        }),
        (e.prototype.update = function (t, e, n, r) {
          return !(
            3 == this.dirty ||
            !t.sameMarkup(this.node) ||
            (this.updateInner(t, e, n, r), 0)
          );
        }),
        (e.prototype.updateInner = function (t, e, n, r) {
          this.updateOuterDeco(e),
            (this.node = t),
            (this.innerDeco = n),
            this.contentDOM && this.updateChildren(r, this.posAtStart),
            (this.dirty = 0);
        }),
        (e.prototype.updateOuterDeco = function (t) {
          if (!Nn(t, this.outerDeco)) {
            var e = 1 != this.nodeDOM.nodeType,
              n = this.dom;
            (this.dom = On(
              this.dom,
              this.nodeDOM,
              xn(this.outerDeco, this.node, e),
              xn(t, this.node, e),
            )),
              this.dom != n &&
                ((n.pmViewDesc = null), (this.dom.pmViewDesc = this)),
              (this.outerDeco = t);
          }
        }),
        (e.prototype.selectNode = function () {
          this.nodeDOM.classList.add('ProseMirror-selectednode'),
            (!this.contentDOM && this.node.type.spec.draggable) ||
              (this.dom.draggable = !0);
        }),
        (e.prototype.deselectNode = function () {
          this.nodeDOM.classList.remove('ProseMirror-selectednode'),
            (!this.contentDOM && this.node.type.spec.draggable) ||
              this.dom.removeAttribute('draggable');
        }),
        (n.domAtom.get = function () {
          return this.node.isAtom;
        }),
        Object.defineProperties(e.prototype, n),
        e
      );
    })(hn);
  function vn(t, e, n, r, o) {
    return Cn(r, e, t), new mn(null, t, e, n, r, r, r, o, 0);
  }
  var gn = (function (t) {
      function e(e, n, r, o, i, s, a) {
        t.call(this, e, n, r, o, i, null, s, a);
      }
      t && (e.__proto__ = t),
        (e.prototype = Object.create(t && t.prototype)),
        (e.prototype.constructor = e);
      var n = { domAtom: { configurable: !0 } };
      return (
        (e.prototype.parseRule = function () {
          for (
            var t = this.nodeDOM.parentNode;
            t && t != this.dom && !t.pmIsDeco;

          )
            t = t.parentNode;
          return { skip: t || !0 };
        }),
        (e.prototype.update = function (t, e, n, r) {
          return !(
            3 == this.dirty ||
            (0 != this.dirty && !this.inParent()) ||
            !t.sameMarkup(this.node) ||
            (this.updateOuterDeco(e),
            (0 == this.dirty && t.text == this.node.text) ||
              t.text == this.nodeDOM.nodeValue ||
              ((this.nodeDOM.nodeValue = t.text),
              r.trackWrites == this.nodeDOM && (r.trackWrites = null)),
            (this.node = t),
            (this.dirty = 0),
            0)
          );
        }),
        (e.prototype.inParent = function () {
          for (
            var t = this.parent.contentDOM, e = this.nodeDOM;
            e;
            e = e.parentNode
          )
            if (e == t) return !0;
          return !1;
        }),
        (e.prototype.domFromPos = function (t) {
          return { node: this.nodeDOM, offset: t };
        }),
        (e.prototype.localPosFromDOM = function (e, n, r) {
          return e == this.nodeDOM
            ? this.posAtStart + Math.min(n, this.node.text.length)
            : t.prototype.localPosFromDOM.call(this, e, n, r);
        }),
        (e.prototype.ignoreMutation = function (t) {
          return 'characterData' != t.type && 'selection' != t.type;
        }),
        (e.prototype.slice = function (t, n, r) {
          var o = this.node.cut(t, n),
            i = document.createTextNode(o.text);
          return new e(this.parent, o, this.outerDeco, this.innerDeco, i, i, r);
        }),
        (n.domAtom.get = function () {
          return !1;
        }),
        Object.defineProperties(e.prototype, n),
        e
      );
    })(mn),
    yn = (function (t) {
      function e() {
        t.apply(this, arguments);
      }
      t && (e.__proto__ = t),
        (e.prototype = Object.create(t && t.prototype)),
        (e.prototype.constructor = e);
      var n = { domAtom: { configurable: !0 } };
      return (
        (e.prototype.parseRule = function () {
          return { ignore: !0 };
        }),
        (e.prototype.matchesHack = function () {
          return 0 == this.dirty;
        }),
        (n.domAtom.get = function () {
          return !0;
        }),
        Object.defineProperties(e.prototype, n),
        e
      );
    })(hn),
    wn = (function (t) {
      function e(e, n, r, o, i, s, a, c, h, p) {
        t.call(this, e, n, r, o, i, s, a, h, p), (this.spec = c);
      }
      return (
        t && (e.__proto__ = t),
        (e.prototype = Object.create(t && t.prototype)),
        (e.prototype.constructor = e),
        (e.prototype.update = function (e, n, r, o) {
          if (3 == this.dirty) return !1;
          if (this.spec.update) {
            var i = this.spec.update(e, n, r);
            return i && this.updateInner(e, n, r, o), i;
          }
          return (
            !(!this.contentDOM && !e.isLeaf) &&
            t.prototype.update.call(this, e, n, r, o)
          );
        }),
        (e.prototype.selectNode = function () {
          this.spec.selectNode
            ? this.spec.selectNode()
            : t.prototype.selectNode.call(this);
        }),
        (e.prototype.deselectNode = function () {
          this.spec.deselectNode
            ? this.spec.deselectNode()
            : t.prototype.deselectNode.call(this);
        }),
        (e.prototype.setSelection = function (e, n, r, o) {
          this.spec.setSelection
            ? this.spec.setSelection(e, n, r)
            : t.prototype.setSelection.call(this, e, n, r, o);
        }),
        (e.prototype.destroy = function () {
          this.spec.destroy && this.spec.destroy(),
            t.prototype.destroy.call(this);
        }),
        (e.prototype.stopEvent = function (t) {
          return !!this.spec.stopEvent && this.spec.stopEvent(t);
        }),
        (e.prototype.ignoreMutation = function (e) {
          return this.spec.ignoreMutation
            ? this.spec.ignoreMutation(e)
            : t.prototype.ignoreMutation.call(this, e);
        }),
        e
      );
    })(mn);
  function bn(t, e, n) {
    for (var r = t.firstChild, o = !1, i = 0; i < e.length; i++) {
      var s = e[i],
        a = s.dom;
      if (a.parentNode == t) {
        for (; a != r; ) (r = Dn(r)), (o = !0);
        r = r.nextSibling;
      } else (o = !0), t.insertBefore(a, r);
      if (s instanceof dn) {
        var c = r ? r.previousSibling : t.lastChild;
        bn(s.contentDOM, s.children, n), (r = c ? c.nextSibling : t.firstChild);
      }
    }
    for (; r; ) (r = Dn(r)), (o = !0);
    o && n.trackWrites == t && (n.trackWrites = null);
  }
  function kn(t) {
    t && (this.nodeName = t);
  }
  kn.prototype = Object.create(null);
  var Sn = [new kn()];
  function xn(t, e, n) {
    if (0 == t.length) return Sn;
    for (var r = n ? Sn[0] : new kn(), o = [r], i = 0; i < t.length; i++) {
      var s = t[i].type.attrs;
      if (s)
        for (var a in (s.nodeName && o.push((r = new kn(s.nodeName))), s)) {
          var c = s[a];
          null != c &&
            (n &&
              1 == o.length &&
              o.push((r = new kn(e.isInline ? 'span' : 'div'))),
            'class' == a
              ? (r.class = (r.class ? r.class + ' ' : '') + c)
              : 'style' == a
              ? (r.style = (r.style ? r.style + ';' : '') + c)
              : 'nodeName' != a && (r[a] = c));
        }
    }
    return o;
  }
  function On(t, e, n, r) {
    if (n == Sn && r == Sn) return e;
    for (var o = e, i = 0; i < r.length; i++) {
      var s = r[i],
        a = n[i];
      if (i) {
        var c = void 0;
        (a &&
          a.nodeName == s.nodeName &&
          o != t &&
          (c = o.parentNode) &&
          c.tagName.toLowerCase() == s.nodeName) ||
          (((c = document.createElement(s.nodeName)).pmIsDeco = !0),
          c.appendChild(o),
          (a = Sn[0])),
          (o = c);
      }
      Mn(o, a || Sn[0], s);
    }
    return o;
  }
  function Mn(t, e, n) {
    for (var r in e)
      'class' == r ||
        'style' == r ||
        'nodeName' == r ||
        r in n ||
        t.removeAttribute(r);
    for (var o in n)
      'class' != o &&
        'style' != o &&
        'nodeName' != o &&
        n[o] != e[o] &&
        t.setAttribute(o, n[o]);
    if (e.class != n.class) {
      for (
        var i = e.class ? e.class.split(' ').filter(Boolean) : ln,
          s = n.class ? n.class.split(' ').filter(Boolean) : ln,
          a = 0;
        a < i.length;
        a++
      )
        -1 == s.indexOf(i[a]) && t.classList.remove(i[a]);
      for (var c = 0; c < s.length; c++)
        -1 == i.indexOf(s[c]) && t.classList.add(s[c]);
    }
    if (e.style != n.style) {
      if (e.style)
        for (
          var h,
            p = /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g;
          (h = p.exec(e.style));

        )
          t.style.removeProperty(h[1]);
      n.style && (t.style.cssText += n.style);
    }
  }
  function Cn(t, e, n) {
    return On(t, t, Sn, xn(e, n, 1 != t.nodeType));
  }
  function Nn(t, e) {
    if (t.length != e.length) return !1;
    for (var n = 0; n < t.length; n++) if (!t[n].type.eq(e[n].type)) return !1;
    return !0;
  }
  function Dn(t) {
    var e = t.nextSibling;
    return t.parentNode.removeChild(t), e;
  }
  var Tn = function (t, e) {
    (this.top = t),
      (this.lock = e),
      (this.index = 0),
      (this.stack = []),
      (this.changed = !1),
      (this.preMatch = (function (t, e) {
        for (
          var n = t.childCount, r = e.length, o = new Map();
          n > 0 && r > 0;
          r--
        ) {
          var i = e[r - 1],
            s = i.node;
          if (s) {
            if (s != t.child(n - 1)) break;
            --n, o.set(i, n);
          }
        }
        return { index: n, matched: o };
      })(t.node.content, t.children));
  };
  function En(t, e) {
    return t.type.side - e.type.side;
  }
  function An(t, e, n, r, o) {
    for (var i = [], s = 0, a = 0; s < t.length; s++) {
      var c = t[s],
        h = a,
        p = (a += c.size);
      h >= n || p <= e
        ? i.push(c)
        : (h < e && i.push(c.slice(0, e - h, r)),
          o && (i.push(o), (o = null)),
          p > n && i.push(c.slice(n - h, c.size, r)));
    }
    return i;
  }
  function Rn(t, e) {
    var n = t.root.getSelection(),
      r = t.state.doc;
    if (!n.focusNode) return null;
    var o = t.docView.nearestDesc(n.focusNode),
      i = o && 0 == o.size,
      s = t.docView.posFromDOM(n.focusNode, n.focusOffset);
    if (s < 0) return null;
    var a,
      c,
      h = r.resolve(s);
    if (_e(n)) {
      for (a = h; o && !o.node; ) o = o.parent;
      if (
        o &&
        o.node.isAtom &&
        se.isSelectable(o.node) &&
        o.parent &&
        (!o.node.isInline ||
          !(function (t, e, n) {
            for (var r = 0 == e, o = e == Fe(t); r || o; ) {
              if (t == n) return !0;
              var i = Ee(t);
              if (!(t = t.parentNode)) return !1;
              (r = r && 0 == i), (o = o && i == Fe(t));
            }
          })(n.focusNode, n.focusOffset, o.dom))
      ) {
        var p = o.posBefore;
        c = new se(s == p ? h : r.resolve(p));
      }
    } else {
      var l = t.docView.posFromDOM(n.anchorNode, n.anchorOffset);
      if (l < 0) return null;
      a = r.resolve(l);
    }
    return (
      c ||
        (c = jn(
          t,
          a,
          h,
          'pointer' == e || (t.state.selection.head < h.pos && !i) ? 1 : -1,
        )),
      c
    );
  }
  function zn(t) {
    return t.editable
      ? t.hasFocus()
      : Ln(t) &&
          document.activeElement &&
          document.activeElement.contains(t.dom);
  }
  function Pn(t, e) {
    var n = t.state.selection;
    if ((_n(t, n), zn(t))) {
      if ((t.domObserver.disconnectSelection(), t.cursorWrapper))
        !(function (t) {
          var e = t.root.getSelection(),
            n = document.createRange(),
            r = t.cursorWrapper.dom,
            o = 'IMG' == r.nodeName;
          o ? n.setEnd(r.parentNode, Ee(r) + 1) : n.setEnd(r, 0),
            n.collapse(!1),
            e.removeAllRanges(),
            e.addRange(n),
            !o &&
              !t.state.selection.visible &&
              Oe.ie &&
              Oe.ie_version <= 11 &&
              ((r.disabled = !0), (r.disabled = !1));
        })(t);
      else {
        var r,
          o,
          i = n.anchor,
          s = n.head;
        !In ||
          n instanceof oe ||
          (n.$from.parent.inlineContent || (r = Bn(t, n.from)),
          n.empty || n.$from.parent.inlineContent || (o = Bn(t, n.to))),
          t.docView.setSelection(i, s, t.root, e),
          In && (r && Vn(r), o && Vn(o)),
          n.visible
            ? t.dom.classList.remove('ProseMirror-hideselection')
            : (t.dom.classList.add('ProseMirror-hideselection'),
              'onselectionchange' in document &&
                (function (t) {
                  var e = t.dom.ownerDocument;
                  e.removeEventListener(
                    'selectionchange',
                    t.hideSelectionGuard,
                  );
                  var n = t.root.getSelection(),
                    r = n.anchorNode,
                    o = n.anchorOffset;
                  e.addEventListener(
                    'selectionchange',
                    (t.hideSelectionGuard = function () {
                      (n.anchorNode == r && n.anchorOffset == o) ||
                        (e.removeEventListener(
                          'selectionchange',
                          t.hideSelectionGuard,
                        ),
                        setTimeout(function () {
                          (zn(t) && !t.state.selection.visible) ||
                            t.dom.classList.remove('ProseMirror-hideselection');
                        }, 20));
                    }),
                  );
                })(t));
      }
      t.domObserver.setCurSelection(), t.domObserver.connectSelection();
    }
  }
  (Tn.prototype.destroyBetween = function (t, e) {
    if (t != e) {
      for (var n = t; n < e; n++) this.top.children[n].destroy();
      this.top.children.splice(t, e - t), (this.changed = !0);
    }
  }),
    (Tn.prototype.destroyRest = function () {
      this.destroyBetween(this.index, this.top.children.length);
    }),
    (Tn.prototype.syncToMarks = function (t, e, n) {
      for (
        var r = 0, o = this.stack.length >> 1, i = Math.min(o, t.length);
        r < i &&
        (r == o - 1 ? this.top : this.stack[(r + 1) << 1]).matchesMark(t[r]) &&
        !1 !== t[r].type.spec.spanning;

      )
        r++;
      for (; r < o; )
        this.destroyRest(),
          (this.top.dirty = 0),
          (this.index = this.stack.pop()),
          (this.top = this.stack.pop()),
          o--;
      for (; o < t.length; ) {
        this.stack.push(this.top, this.index + 1);
        for (
          var s = -1, a = this.index;
          a < Math.min(this.index + 3, this.top.children.length);
          a++
        )
          if (this.top.children[a].matchesMark(t[o])) {
            s = a;
            break;
          }
        if (s > -1)
          s > this.index &&
            ((this.changed = !0), this.destroyBetween(this.index, s)),
            (this.top = this.top.children[this.index]);
        else {
          var c = dn.create(this.top, t[o], e, n);
          this.top.children.splice(this.index, 0, c),
            (this.top = c),
            (this.changed = !0);
        }
        (this.index = 0), o++;
      }
    }),
    (Tn.prototype.findNodeMatch = function (t, e, n, r) {
      var o = this.top.children,
        i = -1;
      if (r >= this.preMatch.index) {
        for (var s = this.index; s < o.length; s++)
          if (o[s].matchesNode(t, e, n)) {
            i = s;
            break;
          }
      } else
        for (var a = this.index, c = Math.min(o.length, a + 1); a < c; a++) {
          var h = o[a];
          if (h.matchesNode(t, e, n) && !this.preMatch.matched.has(h)) {
            i = a;
            break;
          }
        }
      return !(i < 0 || (this.destroyBetween(this.index, i), this.index++, 0));
    }),
    (Tn.prototype.updateNextNode = function (t, e, n, r, o) {
      for (var i = this.index; i < this.top.children.length; i++) {
        var s = this.top.children[i];
        if (s instanceof mn) {
          var a = this.preMatch.matched.get(s);
          if (null != a && a != o) return !1;
          var c = s.dom;
          if (
            (!this.lock ||
              !(
                c == this.lock ||
                (1 == c.nodeType && c.contains(this.lock.parentNode))
              ) ||
              (t.isText &&
                s.node &&
                s.node.isText &&
                s.nodeDOM.nodeValue == t.text &&
                3 != s.dirty &&
                Nn(e, s.outerDeco))) &&
            s.update(t, e, n, r)
          )
            return (
              this.destroyBetween(this.index, i),
              s.dom != c && (this.changed = !0),
              this.index++,
              !0
            );
          break;
        }
      }
      return !1;
    }),
    (Tn.prototype.addNode = function (t, e, n, r, o) {
      this.top.children.splice(
        this.index++,
        0,
        mn.create(this.top, t, e, n, r, o),
      ),
        (this.changed = !0);
    }),
    (Tn.prototype.placeWidget = function (t, e, n) {
      var r =
        this.index < this.top.children.length
          ? this.top.children[this.index]
          : null;
      if (
        !r ||
        !r.matchesWidget(t) ||
        (t != r.widget && r.widget.type.toDOM.parentNode)
      ) {
        var o = new fn(this.top, t, e, n);
        this.top.children.splice(this.index++, 0, o), (this.changed = !0);
      } else this.index++;
    }),
    (Tn.prototype.addTextblockHacks = function () {
      for (var t = this.top.children[this.index - 1]; t instanceof dn; )
        t = t.children[t.children.length - 1];
      if (!t || !(t instanceof gn) || /\n$/.test(t.node.text))
        if (
          this.index < this.top.children.length &&
          this.top.children[this.index].matchesHack()
        )
          this.index++;
        else {
          var e = document.createElement('br');
          this.top.children.splice(
            this.index++,
            0,
            new yn(this.top, ln, e, null),
          ),
            (this.changed = !0);
        }
    });
  var In = Oe.safari || (Oe.chrome && Oe.chrome_version < 63);
  function Bn(t, e) {
    var n = t.docView.domFromPos(e, 0),
      r = n.node,
      o = n.offset,
      i = o < r.childNodes.length ? r.childNodes[o] : null,
      s = o ? r.childNodes[o - 1] : null;
    if (Oe.safari && i && 'false' == i.contentEditable) return Fn(i);
    if (
      !(
        (i && 'false' != i.contentEditable) ||
        (s && 'false' != s.contentEditable)
      )
    ) {
      if (i) return Fn(i);
      if (s) return Fn(s);
    }
  }
  function Fn(t) {
    return (
      (t.contentEditable = 'true'),
      Oe.safari && t.draggable && ((t.draggable = !1), (t.wasDraggable = !0)),
      t
    );
  }
  function Vn(t) {
    (t.contentEditable = 'false'),
      t.wasDraggable && ((t.draggable = !0), (t.wasDraggable = null));
  }
  function _n(t, e) {
    if (e instanceof se) {
      var n = t.docView.descAt(e.from);
      n != t.lastSelectedViewDesc &&
        ($n(t), n && n.selectNode(), (t.lastSelectedViewDesc = n));
    } else $n(t);
  }
  function $n(t) {
    t.lastSelectedViewDesc &&
      (t.lastSelectedViewDesc.parent && t.lastSelectedViewDesc.deselectNode(),
      (t.lastSelectedViewDesc = null));
  }
  function jn(t, e, n, r) {
    return (
      t.someProp('createSelectionBetween', function (r) {
        return r(t, e, n);
      }) || oe.between(e, n, r)
    );
  }
  function Ln(t) {
    var e = t.root.getSelection();
    if (!e.anchorNode) return !1;
    try {
      return (
        t.dom.contains(
          3 == e.anchorNode.nodeType ? e.anchorNode.parentNode : e.anchorNode,
        ) &&
        (t.editable ||
          t.dom.contains(
            3 == e.focusNode.nodeType ? e.focusNode.parentNode : e.focusNode,
          ))
      );
    } catch (t) {
      return !1;
    }
  }
  function Jn(t, e) {
    var n = t.selection,
      r = n.$anchor,
      o = n.$head,
      i = e > 0 ? r.max(o) : r.min(o),
      s = i.parent.inlineContent
        ? i.depth
          ? t.doc.resolve(e > 0 ? i.after() : i.before())
          : null
        : i;
    return s && ee.findFrom(s, e);
  }
  function qn(t, e) {
    return t.dispatch(t.state.tr.setSelection(e).scrollIntoView()), !0;
  }
  function Wn(t, e, n) {
    var r = t.state.selection;
    if (!(r instanceof oe)) {
      if (r instanceof se && r.node.isInline)
        return qn(t, new oe(e > 0 ? r.$to : r.$from));
      var o = Jn(t.state, e);
      return !!o && qn(t, o);
    }
    if (!r.empty || n.indexOf('s') > -1) return !1;
    if (t.endOfTextblock(e > 0 ? 'right' : 'left')) {
      var i = Jn(t.state, e);
      return !!(i && i instanceof se) && qn(t, i);
    }
    if (!(Oe.mac && n.indexOf('m') > -1)) {
      var s,
        a = r.$head,
        c = a.textOffset ? null : e < 0 ? a.nodeBefore : a.nodeAfter;
      if (!c || c.isText) return !1;
      var h = e < 0 ? a.pos - c.nodeSize : a.pos;
      return (
        !!(c.isAtom || ((s = t.docView.descAt(h)) && !s.contentDOM)) &&
        (se.isSelectable(c)
          ? qn(t, new se(e < 0 ? t.state.doc.resolve(a.pos - c.nodeSize) : a))
          : !!Oe.webkit &&
            qn(t, new oe(t.state.doc.resolve(e < 0 ? h : h + c.nodeSize))))
      );
    }
  }
  function Kn(t) {
    return 3 == t.nodeType ? t.nodeValue.length : t.childNodes.length;
  }
  function Hn(t) {
    var e = t.pmViewDesc;
    return e && 0 == e.size && (t.nextSibling || 'BR' != t.nodeName);
  }
  function Un(t) {
    var e = t.root.getSelection(),
      n = e.focusNode,
      r = e.focusOffset;
    if (n) {
      var o,
        i,
        s = !1;
      for (
        Oe.gecko &&
        1 == n.nodeType &&
        r < Kn(n) &&
        Hn(n.childNodes[r]) &&
        (s = !0);
        ;

      )
        if (r > 0) {
          if (1 != n.nodeType) break;
          var a = n.childNodes[r - 1];
          if (Hn(a)) (o = n), (i = --r);
          else {
            if (3 != a.nodeType) break;
            r = (n = a).nodeValue.length;
          }
        } else {
          if (Xn(n)) break;
          for (var c = n.previousSibling; c && Hn(c); )
            (o = n.parentNode), (i = Ee(c)), (c = c.previousSibling);
          if (c) r = Kn((n = c));
          else {
            if ((n = n.parentNode) == t.dom) break;
            r = 0;
          }
        }
      s ? Yn(t, e, n, r) : o && Yn(t, e, o, i);
    }
  }
  function Gn(t) {
    var e = t.root.getSelection(),
      n = e.focusNode,
      r = e.focusOffset;
    if (n) {
      for (var o, i, s = Kn(n); ; )
        if (r < s) {
          if (1 != n.nodeType) break;
          if (!Hn(n.childNodes[r])) break;
          (o = n), (i = ++r);
        } else {
          if (Xn(n)) break;
          for (var a = n.nextSibling; a && Hn(a); )
            (o = a.parentNode), (i = Ee(a) + 1), (a = a.nextSibling);
          if (a) (r = 0), (s = Kn((n = a)));
          else {
            if ((n = n.parentNode) == t.dom) break;
            r = s = 0;
          }
        }
      o && Yn(t, e, o, i);
    }
  }
  function Xn(t) {
    var e = t.pmViewDesc;
    return e && e.node && e.node.isBlock;
  }
  function Yn(t, e, n, r) {
    if (_e(e)) {
      var o = document.createRange();
      o.setEnd(n, r), o.setStart(n, r), e.removeAllRanges(), e.addRange(o);
    } else e.extend && e.extend(n, r);
    t.domObserver.setCurSelection();
    var i = t.state;
    setTimeout(function () {
      t.state == i && Pn(t);
    }, 50);
  }
  function Qn(t, e, n) {
    var r = t.state.selection;
    if ((r instanceof oe && !r.empty) || n.indexOf('s') > -1) return !1;
    if (Oe.mac && n.indexOf('m') > -1) return !1;
    var o = r.$from,
      i = r.$to;
    if (!o.parent.inlineContent || t.endOfTextblock(e < 0 ? 'up' : 'down')) {
      var s = Jn(t.state, e);
      if (s && s instanceof se) return qn(t, s);
    }
    if (!o.parent.inlineContent) {
      var a = e < 0 ? o : i,
        c = r instanceof ce ? ee.near(a, e) : ee.findFrom(a, e);
      return !!c && qn(t, c);
    }
    return !1;
  }
  function Zn(t, e) {
    if (!(t.state.selection instanceof oe)) return !0;
    var n = t.state.selection,
      r = n.$head,
      o = n.$anchor,
      i = n.empty;
    if (!r.sameParent(o)) return !0;
    if (!i) return !1;
    if (t.endOfTextblock(e > 0 ? 'forward' : 'backward')) return !0;
    var s = !r.textOffset && (e < 0 ? r.nodeBefore : r.nodeAfter);
    if (s && !s.isText) {
      var a = t.state.tr;
      return (
        e < 0
          ? a.delete(r.pos - s.nodeSize, r.pos)
          : a.delete(r.pos, r.pos + s.nodeSize),
        t.dispatch(a),
        !0
      );
    }
    return !1;
  }
  function tr(t, e, n) {
    t.domObserver.stop(), (e.contentEditable = n), t.domObserver.start();
  }
  function er(t) {
    var e = t.pmViewDesc;
    if (e) return e.parseRule();
    if ('BR' == t.nodeName && t.parentNode) {
      if (Oe.safari && /^(ul|ol)$/i.test(t.parentNode.nodeName)) {
        var n = document.createElement('div');
        return n.appendChild(document.createElement('li')), { skip: n };
      }
      if (
        t.parentNode.lastChild == t ||
        (Oe.safari && /^(tr|table)$/i.test(t.parentNode.nodeName))
      )
        return { ignore: !0 };
    } else if ('IMG' == t.nodeName && t.getAttribute('mark-placeholder'))
      return { ignore: !0 };
  }
  function nr(t, e, n) {
    return Math.max(n.anchor, n.head) > e.content.size
      ? null
      : jn(t, e.resolve(n.anchor), e.resolve(n.head));
  }
  function rr(t, e, n) {
    for (
      var r = t.depth, o = e ? t.end() : t.pos;
      r > 0 && (e || t.indexAfter(r) == t.node(r).childCount);

    )
      r--, o++, (e = !1);
    if (n)
      for (var i = t.node(r).maybeChild(t.indexAfter(r)); i && !i.isLeaf; )
        (i = i.firstChild), o++;
    return o;
  }
  function or(t, e) {
    for (
      var n = [], r = e.content, o = e.openStart, i = e.openEnd;
      o > 1 && i > 1 && 1 == r.childCount && 1 == r.firstChild.childCount;

    ) {
      o--, i--;
      var s = r.firstChild;
      n.push(s.type.name, s.attrs != s.type.defaultAttrs ? s.attrs : null),
        (r = s.content);
    }
    var a = t.someProp('clipboardSerializer') || dt.fromSchema(t.state.schema),
      c = fr(),
      h = c.createElement('div');
    h.appendChild(a.serializeFragment(r, { document: c }));
    for (
      var p, l = h.firstChild;
      l && 1 == l.nodeType && (p = pr[l.nodeName.toLowerCase()]);

    ) {
      for (var f = p.length - 1; f >= 0; f--) {
        for (var u = c.createElement(p[f]); h.firstChild; )
          u.appendChild(h.firstChild);
        h.appendChild(u);
      }
      l = h.firstChild;
    }
    return (
      l &&
        1 == l.nodeType &&
        l.setAttribute('data-pm-slice', o + ' ' + i + ' ' + JSON.stringify(n)),
      {
        dom: h,
        text:
          t.someProp('clipboardTextSerializer', function (t) {
            return t(e);
          }) || e.content.textBetween(0, e.content.size, '\n\n'),
      }
    );
  }
  function ir(t, e, n, r, i) {
    var s,
      a,
      c = i.parent.type.spec.code;
    if (!n && !e) return null;
    var h = e && (r || c || !n);
    if (h) {
      if (
        (t.someProp('transformPastedText', function (t) {
          e = t(e, c || r);
        }),
        c)
      )
        return new l(
          o.from(t.state.schema.text(e.replace(/\r\n?/g, '\n'))),
          0,
          0,
        );
      var p = t.someProp('clipboardTextParser', function (t) {
        return t(e, i, r);
      });
      p
        ? (a = p)
        : ((s = document.createElement('div')),
          e
            .trim()
            .split(/(?:\r\n?|\n)+/)
            .forEach(function (t) {
              s.appendChild(document.createElement('p')).textContent = t;
            }));
    } else
      t.someProp('transformPastedHTML', function (t) {
        n = t(n);
      }),
        (s = (function (t) {
          var e = /^(\s*<meta [^>]*>)*/.exec(t);
          e && (t = t.slice(e[0].length));
          var n,
            r = fr().createElement('div'),
            o = /<([a-z][^>\s]+)/i.exec(t);
          if (
            ((n = o && pr[o[1].toLowerCase()]) &&
              (t =
                n
                  .map(function (t) {
                    return '<' + t + '>';
                  })
                  .join('') +
                t +
                n
                  .map(function (t) {
                    return '</' + t + '>';
                  })
                  .reverse()
                  .join('')),
            (r.innerHTML = t),
            n)
          )
            for (var i = 0; i < n.length; i++) r = r.querySelector(n[i]) || r;
          return r;
        })(n));
    var f = s && s.querySelector('[data-pm-slice]'),
      u = f && /^(\d+) (\d+) (.*)/.exec(f.getAttribute('data-pm-slice'));
    if (!a) {
      var d =
        t.someProp('clipboardParser') ||
        t.someProp('domParser') ||
        rt.fromSchema(t.state.schema);
      a = d.parseSlice(s, { preserveWhitespace: !(!h && !u), context: i });
    }
    return (
      (a = u
        ? (function (t, e) {
            if (!t.size) return t;
            var n,
              r = t.content.firstChild.type.schema;
            try {
              n = JSON.parse(e);
            } catch (e) {
              return t;
            }
            for (
              var i = t.content,
                s = t.openStart,
                a = t.openEnd,
                c = n.length - 2;
              c >= 0;
              c -= 2
            ) {
              var h = r.nodes[n[c]];
              if (!h || h.hasRequiredAttrs()) break;
              (i = o.from(h.create(n[c + 1], i))), s++, a++;
            }
            return new l(i, s, a);
          })(
            (function (t, e, n) {
              return (
                e < t.openStart &&
                  (t = new l(
                    hr(t.content, -1, e, t.openStart, 0, t.openEnd),
                    e,
                    t.openEnd,
                  )),
                n < t.openEnd &&
                  (t = new l(
                    hr(t.content, 1, n, t.openEnd, 0, 0),
                    t.openStart,
                    n,
                  )),
                t
              );
            })(a, +u[1], +u[2]),
            u[3],
          )
        : l.maxOpen(
            (function (t, e) {
              if (t.childCount < 2) return t;
              for (
                var n = function (n) {
                    var r = e.node(n).contentMatchAt(e.index(n)),
                      i = void 0,
                      s = [];
                    if (
                      (t.forEach(function (t) {
                        if (s) {
                          var e,
                            n = r.findWrapping(t.type);
                          if (!n) return (s = null);
                          if (
                            (e =
                              s.length &&
                              i.length &&
                              ar(n, i, t, s[s.length - 1], 0))
                          )
                            s[s.length - 1] = e;
                          else {
                            s.length &&
                              (s[s.length - 1] = cr(s[s.length - 1], i.length));
                            var o = sr(t, n);
                            s.push(o),
                              (r = r.matchType(o.type, o.attrs)),
                              (i = n);
                          }
                        }
                      }),
                      s)
                    )
                      return { v: o.from(s) };
                  },
                  r = e.depth;
                r >= 0;
                r--
              ) {
                var i = n(r);
                if (i) return i.v;
              }
              return t;
            })(a.content, i),
            !1,
          )),
      t.someProp('transformPasted', function (t) {
        a = t(a);
      }),
      a
    );
  }
  function sr(t, e, n) {
    void 0 === n && (n = 0);
    for (var r = e.length - 1; r >= n; r--) t = e[r].create(null, o.from(t));
    return t;
  }
  function ar(t, e, n, r, i) {
    if (i < t.length && i < e.length && t[i] == e[i]) {
      var s = ar(t, e, n, r.lastChild, i + 1);
      if (s) return r.copy(r.content.replaceChild(r.childCount - 1, s));
      if (
        r
          .contentMatchAt(r.childCount)
          .matchType(i == t.length - 1 ? n.type : t[i + 1])
      )
        return r.copy(r.content.append(o.from(sr(n, t, i + 1))));
    }
  }
  function cr(t, e) {
    if (0 == e) return t;
    var n = t.content.replaceChild(t.childCount - 1, cr(t.lastChild, e - 1)),
      r = t.contentMatchAt(t.childCount).fillBefore(o.empty, !0);
    return t.copy(n.append(r));
  }
  function hr(t, e, n, r, i, s) {
    var a = e < 0 ? t.firstChild : t.lastChild,
      c = a.content;
    return (
      i < r - 1 && (c = hr(c, e, n, r, i + 1, s)),
      i >= n &&
        (c =
          e < 0
            ? a
                .contentMatchAt(0)
                .fillBefore(c, t.childCount > 1 || s <= i)
                .append(c)
            : c.append(a.contentMatchAt(a.childCount).fillBefore(o.empty, !0))),
      t.replaceChild(e < 0 ? 0 : t.childCount - 1, a.copy(c))
    );
  }
  var pr = {
      thead: ['table'],
      tbody: ['table'],
      tfoot: ['table'],
      caption: ['table'],
      colgroup: ['table'],
      col: ['table', 'colgroup'],
      tr: ['table', 'tbody'],
      td: ['table', 'tbody', 'tr'],
      th: ['table', 'tbody', 'tr'],
    },
    lr = null;
  function fr() {
    return lr || (lr = document.implementation.createHTMLDocument('title'));
  }
  var ur = {
      childList: !0,
      characterData: !0,
      characterDataOldValue: !0,
      attributes: !0,
      attributeOldValue: !0,
      subtree: !0,
    },
    dr = Oe.ie && Oe.ie_version <= 11,
    mr = function () {
      this.anchorNode = this.anchorOffset = this.focusNode = this.focusOffset = null;
    };
  (mr.prototype.set = function (t) {
    (this.anchorNode = t.anchorNode),
      (this.anchorOffset = t.anchorOffset),
      (this.focusNode = t.focusNode),
      (this.focusOffset = t.focusOffset);
  }),
    (mr.prototype.eq = function (t) {
      return (
        t.anchorNode == this.anchorNode &&
        t.anchorOffset == this.anchorOffset &&
        t.focusNode == this.focusNode &&
        t.focusOffset == this.focusOffset
      );
    });
  var vr = function (t, e) {
    var n = this;
    (this.view = t),
      (this.handleDOMChange = e),
      (this.queue = []),
      (this.flushingSoon = -1),
      (this.observer =
        window.MutationObserver &&
        new window.MutationObserver(function (t) {
          for (var e = 0; e < t.length; e++) n.queue.push(t[e]);
          Oe.ie &&
          Oe.ie_version <= 11 &&
          t.some(function (t) {
            return (
              ('childList' == t.type && t.removedNodes.length) ||
              ('characterData' == t.type &&
                t.oldValue.length > t.target.nodeValue.length)
            );
          })
            ? n.flushSoon()
            : n.flush();
        })),
      (this.currentSelection = new mr()),
      dr &&
        (this.onCharData = function (t) {
          n.queue.push({
            target: t.target,
            type: 'characterData',
            oldValue: t.prevValue,
          }),
            n.flushSoon();
        }),
      (this.onSelectionChange = this.onSelectionChange.bind(this)),
      (this.suppressingSelectionUpdates = !1);
  };
  (vr.prototype.flushSoon = function () {
    var t = this;
    this.flushingSoon < 0 &&
      (this.flushingSoon = window.setTimeout(function () {
        (t.flushingSoon = -1), t.flush();
      }, 20));
  }),
    (vr.prototype.forceFlush = function () {
      this.flushingSoon > -1 &&
        (window.clearTimeout(this.flushingSoon),
        (this.flushingSoon = -1),
        this.flush());
    }),
    (vr.prototype.start = function () {
      this.observer && this.observer.observe(this.view.dom, ur),
        dr &&
          this.view.dom.addEventListener(
            'DOMCharacterDataModified',
            this.onCharData,
          ),
        this.connectSelection();
    }),
    (vr.prototype.stop = function () {
      var t = this;
      if (this.observer) {
        var e = this.observer.takeRecords();
        if (e.length) {
          for (var n = 0; n < e.length; n++) this.queue.push(e[n]);
          window.setTimeout(function () {
            return t.flush();
          }, 20);
        }
        this.observer.disconnect();
      }
      dr &&
        this.view.dom.removeEventListener(
          'DOMCharacterDataModified',
          this.onCharData,
        ),
        this.disconnectSelection();
    }),
    (vr.prototype.connectSelection = function () {
      this.view.dom.ownerDocument.addEventListener(
        'selectionchange',
        this.onSelectionChange,
      );
    }),
    (vr.prototype.disconnectSelection = function () {
      this.view.dom.ownerDocument.removeEventListener(
        'selectionchange',
        this.onSelectionChange,
      );
    }),
    (vr.prototype.suppressSelectionUpdates = function () {
      var t = this;
      (this.suppressingSelectionUpdates = !0),
        setTimeout(function () {
          return (t.suppressingSelectionUpdates = !1);
        }, 50);
    }),
    (vr.prototype.onSelectionChange = function () {
      if (
        (!(e = this.view).editable || e.root.activeElement == e.dom) &&
        Ln(e)
      ) {
        if (this.suppressingSelectionUpdates) return Pn(this.view);
        if (Oe.ie && Oe.ie_version <= 11 && !this.view.state.selection.empty) {
          var t = this.view.root.getSelection();
          if (
            t.focusNode &&
            Pe(t.focusNode, t.focusOffset, t.anchorNode, t.anchorOffset)
          )
            return this.flushSoon();
        }
        this.flush();
      }
      var e;
    }),
    (vr.prototype.setCurSelection = function () {
      this.currentSelection.set(this.view.root.getSelection());
    }),
    (vr.prototype.ignoreSelectionChange = function (t) {
      if (0 == t.rangeCount) return !0;
      var e = t.getRangeAt(0).commonAncestorContainer,
        n = this.view.docView.nearestDesc(e);
      return n &&
        n.ignoreMutation({
          type: 'selection',
          target: 3 == e.nodeType ? e.parentNode : e,
        })
        ? (this.setCurSelection(), !0)
        : void 0;
    }),
    (vr.prototype.flush = function () {
      if (this.view.docView && !(this.flushingSoon > -1)) {
        var t = this.observer ? this.observer.takeRecords() : [];
        this.queue.length &&
          ((t = this.queue.concat(t)), (this.queue.length = 0));
        var e = this.view.root.getSelection(),
          n =
            !this.suppressingSelectionUpdates &&
            !this.currentSelection.eq(e) &&
            Ln(this.view) &&
            !this.ignoreSelectionChange(e),
          r = -1,
          o = -1,
          i = !1,
          s = [];
        if (this.view.editable)
          for (var a = 0; a < t.length; a++) {
            var c = this.registerMutation(t[a], s);
            c &&
              ((r = r < 0 ? c.from : Math.min(c.from, r)),
              (o = o < 0 ? c.to : Math.max(c.to, o)),
              c.typeOver && (i = !0));
          }
        if (Oe.gecko && s.length > 1) {
          var h = s.filter(function (t) {
            return 'BR' == t.nodeName;
          });
          if (2 == h.length) {
            var p = h[0],
              l = h[1];
            p.parentNode && p.parentNode.parentNode == l.parentNode
              ? l.remove()
              : p.remove();
          }
        }
        (r > -1 || n) &&
          (r > -1 &&
            (this.view.docView.markDirty(r, o),
            (f = this.view),
            gr ||
              ((gr = !0),
              'normal' == getComputedStyle(f.dom).whiteSpace &&
                console.warn(
                  "ProseMirror expects the CSS white-space property to be set, preferably to 'pre-wrap'. It is recommended to load style/prosemirror.css from the prosemirror-view package.",
                ))),
          this.handleDOMChange(r, o, i, s),
          this.view.docView.dirty
            ? this.view.updateState(this.view.state)
            : this.currentSelection.eq(e) || Pn(this.view),
          this.currentSelection.set(e));
      }
      var f;
    }),
    (vr.prototype.registerMutation = function (t, e) {
      if (e.indexOf(t.target) > -1) return null;
      var n = this.view.docView.nearestDesc(t.target);
      if (
        'attributes' == t.type &&
        (n == this.view.docView ||
          'contenteditable' == t.attributeName ||
          ('style' == t.attributeName &&
            !t.oldValue &&
            !t.target.getAttribute('style')))
      )
        return null;
      if (!n || n.ignoreMutation(t)) return null;
      if ('childList' == t.type) {
        for (var r = 0; r < t.addedNodes.length; r++) e.push(t.addedNodes[r]);
        if (
          n.contentDOM &&
          n.contentDOM != n.dom &&
          !n.contentDOM.contains(t.target)
        )
          return { from: n.posBefore, to: n.posAfter };
        var o = t.previousSibling,
          i = t.nextSibling;
        if (Oe.ie && Oe.ie_version <= 11 && t.addedNodes.length)
          for (var s = 0; s < t.addedNodes.length; s++) {
            var a = t.addedNodes[s],
              c = a.previousSibling,
              h = a.nextSibling;
            (!c || Array.prototype.indexOf.call(t.addedNodes, c) < 0) &&
              (o = c),
              (!h || Array.prototype.indexOf.call(t.addedNodes, h) < 0) &&
                (i = h);
          }
        var p = o && o.parentNode == t.target ? Ee(o) + 1 : 0,
          l = n.localPosFromDOM(t.target, p, -1),
          f =
            i && i.parentNode == t.target ? Ee(i) : t.target.childNodes.length;
        return { from: l, to: n.localPosFromDOM(t.target, f, 1) };
      }
      return 'attributes' == t.type
        ? { from: n.posAtStart - n.border, to: n.posAtEnd + n.border }
        : {
            from: n.posAtStart,
            to: n.posAtEnd,
            typeOver: t.target.nodeValue == t.oldValue,
          };
    });
  var gr = !1,
    yr = {},
    wr = {};
  function br(t, e) {
    (t.lastSelectionOrigin = e), (t.lastSelectionTime = Date.now());
  }
  function kr(t) {
    t.someProp('handleDOMEvents', function (e) {
      for (var n in e)
        t.eventHandlers[n] ||
          t.dom.addEventListener(
            n,
            (t.eventHandlers[n] = function (e) {
              return Sr(t, e);
            }),
          );
    });
  }
  function Sr(t, e) {
    return t.someProp('handleDOMEvents', function (n) {
      var r = n[e.type];
      return !!r && (r(t, e) || e.defaultPrevented);
    });
  }
  function xr(t) {
    return { left: t.clientX, top: t.clientY };
  }
  function Or(t, e, n, r, o) {
    if (-1 == r) return !1;
    for (
      var i = t.state.doc.resolve(r),
        s = function (r) {
          if (
            t.someProp(e, function (e) {
              return r > i.depth
                ? e(t, n, i.nodeAfter, i.before(r), o, !0)
                : e(t, n, i.node(r), i.before(r), o, !1);
            })
          )
            return { v: !0 };
        },
        a = i.depth + 1;
      a > 0;
      a--
    ) {
      var c = s(a);
      if (c) return c.v;
    }
    return !1;
  }
  function Mr(t, e, n) {
    t.focused || t.focus();
    var r = t.state.tr.setSelection(e);
    'pointer' == n && r.setMeta('pointer', !0), t.dispatch(r);
  }
  function Cr(t, e, n, r) {
    return (
      Or(t, 'handleDoubleClickOn', e, n, r) ||
      t.someProp('handleDoubleClick', function (n) {
        return n(t, e, r);
      })
    );
  }
  function Nr(t, e, n, r) {
    return (
      Or(t, 'handleTripleClickOn', e, n, r) ||
      t.someProp('handleTripleClick', function (n) {
        return n(t, e, r);
      }) ||
      (function (t, e) {
        var n = t.state.doc;
        if (-1 == e)
          return (
            !!n.inlineContent &&
            (Mr(t, oe.create(n, 0, n.content.size), 'pointer'), !0)
          );
        for (var r = n.resolve(e), o = r.depth + 1; o > 0; o--) {
          var i = o > r.depth ? r.nodeAfter : r.node(o),
            s = r.before(o);
          if (i.inlineContent)
            Mr(t, oe.create(n, s + 1, s + 1 + i.content.size), 'pointer');
          else {
            if (!se.isSelectable(i)) continue;
            Mr(t, se.create(n, s), 'pointer');
          }
          return !0;
        }
      })(t, n)
    );
  }
  function Dr(t) {
    return Ir(t);
  }
  (wr.keydown = function (t, e) {
    if (((t.shiftKey = 16 == e.keyCode || e.shiftKey), !Ar(t, e)))
      if (
        (t.domObserver.forceFlush(),
        (t.lastKeyCode = e.keyCode),
        (t.lastKeyCodeTime = Date.now()),
        !Oe.ios || 13 != e.keyCode || e.ctrlKey || e.altKey || e.metaKey)
      )
        t.someProp('handleKeyDown', function (n) {
          return n(t, e);
        }) ||
        (function (t, e) {
          var n = e.keyCode,
            r = (function (t) {
              var e = '';
              return (
                t.ctrlKey && (e += 'c'),
                t.metaKey && (e += 'm'),
                t.altKey && (e += 'a'),
                t.shiftKey && (e += 's'),
                e
              );
            })(e);
          return 8 == n || (Oe.mac && 72 == n && 'c' == r)
            ? Zn(t, -1) || Un(t)
            : 46 == n || (Oe.mac && 68 == n && 'c' == r)
            ? Zn(t, 1) || Gn(t)
            : 13 == n ||
              27 == n ||
              (37 == n
                ? Wn(t, -1, r) || Un(t)
                : 39 == n
                ? Wn(t, 1, r) || Gn(t)
                : 38 == n
                ? Qn(t, -1, r) || Un(t)
                : 40 == n
                ? (function (t) {
                    if (
                      Oe.safari &&
                      !(t.state.selection.$head.parentOffset > 0)
                    ) {
                      var e = t.root.getSelection(),
                        n = e.focusNode,
                        r = e.focusOffset;
                      if (
                        n &&
                        1 == n.nodeType &&
                        0 == r &&
                        n.firstChild &&
                        'false' == n.firstChild.contentEditable
                      ) {
                        var o = n.firstChild;
                        tr(t, o, !0),
                          setTimeout(function () {
                            return tr(t, o, !1);
                          }, 20);
                      }
                    }
                  })(t) ||
                  Qn(t, 1, r) ||
                  Gn(t)
                : r == (Oe.mac ? 'm' : 'c') &&
                  (66 == n || 73 == n || 89 == n || 90 == n));
        })(t, e)
          ? e.preventDefault()
          : br(t, 'key');
      else {
        var n = Date.now();
        (t.lastIOSEnter = n),
          (t.lastIOSEnterFallbackTimeout = setTimeout(function () {
            t.lastIOSEnter == n &&
              (t.someProp('handleKeyDown', function (e) {
                return e(t, $e(13, 'Enter'));
              }),
              (t.lastIOSEnter = 0));
          }, 200));
      }
  }),
    (wr.keyup = function (t, e) {
      16 == e.keyCode && (t.shiftKey = !1);
    }),
    (wr.keypress = function (t, e) {
      if (
        !(
          Ar(t, e) ||
          !e.charCode ||
          (e.ctrlKey && !e.altKey) ||
          (Oe.mac && e.metaKey)
        )
      )
        if (
          t.someProp('handleKeyPress', function (n) {
            return n(t, e);
          })
        )
          e.preventDefault();
        else {
          var n = t.state.selection;
          if (!(n instanceof oe && n.$from.sameParent(n.$to))) {
            var r = String.fromCharCode(e.charCode);
            t.someProp('handleTextInput', function (e) {
              return e(t, n.$from.pos, n.$to.pos, r);
            }) || t.dispatch(t.state.tr.insertText(r).scrollIntoView()),
              e.preventDefault();
          }
        }
    });
  var Tr = Oe.mac ? 'metaKey' : 'ctrlKey';
  yr.mousedown = function (t, e) {
    t.shiftKey = e.shiftKey;
    var n = Dr(t),
      r = Date.now(),
      o = 'singleClick';
    r - t.lastClick.time < 500 &&
      (function (t, e) {
        var n = e.x - t.clientX,
          r = e.y - t.clientY;
        return n * n + r * r < 100;
      })(e, t.lastClick) &&
      !e[Tr] &&
      ('singleClick' == t.lastClick.type
        ? (o = 'doubleClick')
        : 'doubleClick' == t.lastClick.type && (o = 'tripleClick')),
      (t.lastClick = { time: r, x: e.clientX, y: e.clientY, type: o });
    var i = t.posAtCoords(xr(e));
    i &&
      ('singleClick' == o
        ? (t.mouseDown && t.mouseDown.done(),
          (t.mouseDown = new Er(t, i, e, n)))
        : ('doubleClick' == o ? Cr : Nr)(t, i.pos, i.inside, e)
        ? e.preventDefault()
        : br(t, 'pointer'));
  };
  var Er = function (t, e, n, r) {
    var o,
      i,
      s = this;
    if (
      ((this.view = t),
      (this.startDoc = t.state.doc),
      (this.pos = e),
      (this.event = n),
      (this.flushed = r),
      (this.selectNode = n[Tr]),
      (this.allowDefault = n.shiftKey),
      e.inside > -1)
    )
      (o = t.state.doc.nodeAt(e.inside)), (i = e.inside);
    else {
      var a = t.state.doc.resolve(e.pos);
      (o = a.parent), (i = a.depth ? a.before() : 0);
    }
    this.mightDrag = null;
    var c = r ? null : n.target,
      h = c ? t.docView.nearestDesc(c, !0) : null;
    (this.target = h ? h.dom : null),
      ((o.type.spec.draggable && !1 !== o.type.spec.selectable) ||
        (t.state.selection instanceof se && i == t.state.selection.from)) &&
        (this.mightDrag = {
          node: o,
          pos: i,
          addAttr: this.target && !this.target.draggable,
          setUneditable:
            this.target &&
            Oe.gecko &&
            !this.target.hasAttribute('contentEditable'),
        }),
      this.target &&
        this.mightDrag &&
        (this.mightDrag.addAttr || this.mightDrag.setUneditable) &&
        (this.view.domObserver.stop(),
        this.mightDrag.addAttr && (this.target.draggable = !0),
        this.mightDrag.setUneditable &&
          setTimeout(function () {
            s.view.mouseDown == s &&
              s.target.setAttribute('contentEditable', 'false');
          }, 20),
        this.view.domObserver.start()),
      t.root.addEventListener('mouseup', (this.up = this.up.bind(this))),
      t.root.addEventListener('mousemove', (this.move = this.move.bind(this))),
      br(t, 'pointer');
  };
  function Ar(t, e) {
    return (
      !!t.composing ||
      (!!(Oe.safari && Math.abs(e.timeStamp - t.compositionEndedAt) < 500) &&
        ((t.compositionEndedAt = -2e8), !0))
    );
  }
  (Er.prototype.done = function () {
    this.view.root.removeEventListener('mouseup', this.up),
      this.view.root.removeEventListener('mousemove', this.move),
      this.mightDrag &&
        this.target &&
        (this.view.domObserver.stop(),
        this.mightDrag.addAttr && this.target.removeAttribute('draggable'),
        this.mightDrag.setUneditable &&
          this.target.removeAttribute('contentEditable'),
        this.view.domObserver.start()),
      (this.view.mouseDown = null);
  }),
    (Er.prototype.up = function (t) {
      if (
        (this.done(),
        this.view.dom.contains(
          3 == t.target.nodeType ? t.target.parentNode : t.target,
        ))
      ) {
        var e = this.pos;
        this.view.state.doc != this.startDoc &&
          (e = this.view.posAtCoords(xr(t))),
          this.allowDefault || !e
            ? br(this.view, 'pointer')
            : (function (t, e, n, r, o) {
                return (
                  Or(t, 'handleClickOn', e, n, r) ||
                  t.someProp('handleClick', function (n) {
                    return n(t, e, r);
                  }) ||
                  (o
                    ? (function (t, e) {
                        if (-1 == e) return !1;
                        var n,
                          r,
                          o = t.state.selection;
                        o instanceof se && (n = o.node);
                        for (
                          var i = t.state.doc.resolve(e), s = i.depth + 1;
                          s > 0;
                          s--
                        ) {
                          var a = s > i.depth ? i.nodeAfter : i.node(s);
                          if (se.isSelectable(a)) {
                            r =
                              n &&
                              o.$from.depth > 0 &&
                              s >= o.$from.depth &&
                              i.before(o.$from.depth + 1) == o.$from.pos
                                ? i.before(o.$from.depth)
                                : i.before(s);
                            break;
                          }
                        }
                        return (
                          null != r &&
                          (Mr(t, se.create(t.state.doc, r), 'pointer'), !0)
                        );
                      })(t, n)
                    : (function (t, e) {
                        if (-1 == e) return !1;
                        var n = t.state.doc.resolve(e),
                          r = n.nodeAfter;
                        return (
                          !!(r && r.isAtom && se.isSelectable(r)) &&
                          (Mr(t, new se(n), 'pointer'), !0)
                        );
                      })(t, n))
                );
              })(this.view, e.pos, e.inside, t, this.selectNode)
            ? t.preventDefault()
            : this.flushed ||
              (Oe.safari && this.mightDrag && !this.mightDrag.node.isAtom) ||
              (Oe.chrome &&
                !(this.view.state.selection instanceof oe) &&
                (e.pos == this.view.state.selection.from ||
                  e.pos == this.view.state.selection.to))
            ? (Mr(
                this.view,
                ee.near(this.view.state.doc.resolve(e.pos)),
                'pointer',
              ),
              t.preventDefault())
            : br(this.view, 'pointer');
      }
    }),
    (Er.prototype.move = function (t) {
      !this.allowDefault &&
        (Math.abs(this.event.x - t.clientX) > 4 ||
          Math.abs(this.event.y - t.clientY) > 4) &&
        (this.allowDefault = !0),
        br(this.view, 'pointer'),
        0 == t.buttons && this.done();
    }),
    (yr.touchdown = function (t) {
      Dr(t), br(t, 'pointer');
    }),
    (yr.contextmenu = function (t) {
      return Dr(t);
    });
  var Rr = Oe.android ? 5e3 : -1;
  function zr(t, e) {
    clearTimeout(t.composingTimeout),
      e > -1 &&
        (t.composingTimeout = setTimeout(function () {
          return Ir(t);
        }, e));
  }
  function Pr(t) {
    for (t.composing = !1; t.compositionNodes.length > 0; )
      t.compositionNodes.pop().markParentsDirty();
  }
  function Ir(t, e) {
    if ((t.domObserver.forceFlush(), Pr(t), e || t.docView.dirty)) {
      var n = Rn(t);
      return (
        n && !n.eq(t.state.selection)
          ? t.dispatch(t.state.tr.setSelection(n))
          : t.updateState(t.state),
        !0
      );
    }
    return !1;
  }
  (wr.compositionstart = wr.compositionupdate = function (t) {
    if (!t.composing) {
      t.domObserver.flush();
      var e = t.state,
        n = e.selection.$from;
      if (
        e.selection.empty &&
        (e.storedMarks ||
          (!n.textOffset &&
            n.parentOffset &&
            n.nodeBefore.marks.some(function (t) {
              return !1 === t.type.spec.inclusive;
            })))
      )
        (t.markCursor = t.state.storedMarks || n.marks()),
          Ir(t, !0),
          (t.markCursor = null);
      else if (
        (Ir(t),
        Oe.gecko &&
          e.selection.empty &&
          n.parentOffset &&
          !n.textOffset &&
          n.nodeBefore.marks.length)
      )
        for (
          var r = t.root.getSelection(), o = r.focusNode, i = r.focusOffset;
          o && 1 == o.nodeType && 0 != i;

        ) {
          var s = i < 0 ? o.lastChild : o.childNodes[i - 1];
          if (!s) break;
          if (3 == s.nodeType) {
            r.collapse(s, s.nodeValue.length);
            break;
          }
          (o = s), (i = -1);
        }
      t.composing = !0;
    }
    zr(t, Rr);
  }),
    (wr.compositionend = function (t, e) {
      t.composing &&
        ((t.composing = !1), (t.compositionEndedAt = e.timeStamp), zr(t, 20));
    });
  var Br = (Oe.ie && Oe.ie_version < 15) || (Oe.ios && Oe.webkit_version < 604);
  function Fr(t, e, n, r) {
    var o = ir(t, e, n, t.shiftKey, t.state.selection.$from);
    if (
      t.someProp('handlePaste', function (e) {
        return e(t, r, o || l.empty);
      })
    )
      return !0;
    if (!o) return !1;
    var i = (function (t) {
        return 0 == t.openStart && 0 == t.openEnd && 1 == t.content.childCount
          ? t.content.firstChild
          : null;
      })(o),
      s = i
        ? t.state.tr.replaceSelectionWith(i, t.shiftKey)
        : t.state.tr.replaceSelection(o);
    return (
      t.dispatch(
        s.scrollIntoView().setMeta('paste', !0).setMeta('uiEvent', 'paste'),
      ),
      !0
    );
  }
  (yr.copy = wr.cut = function (t, e) {
    var n = t.state.selection,
      r = 'cut' == e.type;
    if (!n.empty) {
      var o = Br ? null : e.clipboardData,
        i = or(t, n.content()),
        s = i.dom,
        a = i.text;
      o
        ? (e.preventDefault(),
          o.clearData(),
          o.setData('text/html', s.innerHTML),
          o.setData('text/plain', a))
        : (function (t, e) {
            if (t.dom.parentNode) {
              var n = t.dom.parentNode.appendChild(
                document.createElement('div'),
              );
              n.appendChild(e),
                (n.style.cssText =
                  'position: fixed; left: -10000px; top: 10px');
              var r = getSelection(),
                o = document.createRange();
              o.selectNodeContents(e),
                t.dom.blur(),
                r.removeAllRanges(),
                r.addRange(o),
                setTimeout(function () {
                  n.parentNode && n.parentNode.removeChild(n), t.focus();
                }, 50);
            }
          })(t, s),
        r &&
          t.dispatch(
            t.state.tr
              .deleteSelection()
              .scrollIntoView()
              .setMeta('uiEvent', 'cut'),
          );
    }
  }),
    (wr.paste = function (t, e) {
      var n = Br ? null : e.clipboardData;
      n && Fr(t, n.getData('text/plain'), n.getData('text/html'), e)
        ? e.preventDefault()
        : (function (t, e) {
            if (t.dom.parentNode) {
              var n =
                  t.shiftKey || t.state.selection.$from.parent.type.spec.code,
                r = t.dom.parentNode.appendChild(
                  document.createElement(n ? 'textarea' : 'div'),
                );
              n || (r.contentEditable = 'true'),
                (r.style.cssText =
                  'position: fixed; left: -10000px; top: 10px'),
                r.focus(),
                setTimeout(function () {
                  t.focus(),
                    r.parentNode && r.parentNode.removeChild(r),
                    n
                      ? Fr(t, r.value, null, e)
                      : Fr(t, r.textContent, r.innerHTML, e);
                }, 50);
            }
          })(t, e);
    });
  var Vr = function (t, e) {
      (this.slice = t), (this.move = e);
    },
    _r = Oe.mac ? 'altKey' : 'ctrlKey';
  for (var $r in ((yr.dragstart = function (t, e) {
    var n = t.mouseDown;
    if ((n && n.done(), e.dataTransfer)) {
      var r = t.state.selection,
        o = r.empty ? null : t.posAtCoords(xr(e));
      if (o && o.pos >= r.from && o.pos <= (r instanceof se ? r.to - 1 : r.to));
      else if (n && n.mightDrag)
        t.dispatch(
          t.state.tr.setSelection(se.create(t.state.doc, n.mightDrag.pos)),
        );
      else if (e.target && 1 == e.target.nodeType) {
        var i = t.docView.nearestDesc(e.target, !0);
        if (!i || !i.node.type.spec.draggable || i == t.docView) return;
        t.dispatch(
          t.state.tr.setSelection(se.create(t.state.doc, i.posBefore)),
        );
      }
      var s = t.state.selection.content(),
        a = or(t, s),
        c = a.dom,
        h = a.text;
      e.dataTransfer.clearData(),
        e.dataTransfer.setData(Br ? 'Text' : 'text/html', c.innerHTML),
        (e.dataTransfer.effectAllowed = 'copyMove'),
        Br || e.dataTransfer.setData('text/plain', h),
        (t.dragging = new Vr(s, !e[_r]));
    }
  }),
  (yr.dragend = function (t) {
    var e = t.dragging;
    window.setTimeout(function () {
      t.dragging == e && (t.dragging = null);
    }, 50);
  }),
  (wr.dragover = wr.dragenter = function (t, e) {
    return e.preventDefault();
  }),
  (wr.drop = function (t, e) {
    var n = t.dragging;
    if (((t.dragging = null), e.dataTransfer)) {
      var r = t.posAtCoords(xr(e));
      if (r) {
        var o = t.state.doc.resolve(r.pos);
        if (o) {
          var i =
              (n && n.slice) ||
              ir(
                t,
                e.dataTransfer.getData(Br ? 'Text' : 'text/plain'),
                Br ? null : e.dataTransfer.getData('text/html'),
                !1,
                o,
              ),
            s = n && !e[_r];
          if (
            t.someProp('handleDrop', function (n) {
              return n(t, e, i || l.empty, s);
            })
          )
            e.preventDefault();
          else if (i) {
            e.preventDefault();
            var a = i
              ? (function (t, e, n) {
                  var r = t.resolve(e);
                  if (!n.content.size) return e;
                  for (var o = n.content, i = 0; i < n.openStart; i++)
                    o = o.firstChild.content;
                  for (
                    var s = 1;
                    s <= (0 == n.openStart && n.size ? 2 : 1);
                    s++
                  )
                    for (var a = r.depth; a >= 0; a--) {
                      var c =
                          a == r.depth
                            ? 0
                            : r.pos <= (r.start(a + 1) + r.end(a + 1)) / 2
                            ? -1
                            : 1,
                        h = r.index(a) + (c > 0 ? 1 : 0),
                        p = r.node(a),
                        l = !1;
                      if (1 == s) l = p.canReplace(h, h, o);
                      else {
                        var f = p
                          .contentMatchAt(h)
                          .findWrapping(o.firstChild.type);
                        l = f && p.canReplaceWith(h, h, f[0]);
                      }
                      if (l)
                        return 0 == c
                          ? r.pos
                          : c < 0
                          ? r.before(a + 1)
                          : r.after(a + 1);
                    }
                  return null;
                })(t.state.doc, o.pos, i)
              : o.pos;
            null == a && (a = o.pos);
            var c = t.state.tr;
            s && c.deleteSelection();
            var h = c.mapping.map(a),
              p =
                0 == i.openStart && 0 == i.openEnd && 1 == i.content.childCount,
              f = c.doc;
            if (
              (p
                ? c.replaceRangeWith(h, h, i.content.firstChild)
                : c.replaceRange(h, h, i),
              !c.doc.eq(f))
            ) {
              var u = c.doc.resolve(h);
              if (
                p &&
                se.isSelectable(i.content.firstChild) &&
                u.nodeAfter &&
                u.nodeAfter.sameMarkup(i.content.firstChild)
              )
                c.setSelection(new se(u));
              else {
                var d = c.mapping.map(a);
                c.mapping.maps[c.mapping.maps.length - 1].forEach(function (
                  t,
                  e,
                  n,
                  r,
                ) {
                  return (d = r);
                }),
                  c.setSelection(jn(t, u, c.doc.resolve(d)));
              }
              t.focus(), t.dispatch(c.setMeta('uiEvent', 'drop'));
            }
          }
        }
      }
    }
  }),
  (yr.focus = function (t) {
    t.focused ||
      (t.domObserver.stop(),
      t.dom.classList.add('ProseMirror-focused'),
      t.domObserver.start(),
      (t.focused = !0),
      setTimeout(function () {
        t.docView &&
          t.hasFocus() &&
          !t.domObserver.currentSelection.eq(t.root.getSelection()) &&
          Pn(t);
      }, 20));
  }),
  (yr.blur = function (t) {
    t.focused &&
      (t.domObserver.stop(),
      t.dom.classList.remove('ProseMirror-focused'),
      t.domObserver.start(),
      t.domObserver.currentSelection.set({}),
      (t.focused = !1));
  }),
  (yr.beforeinput = function (t, e) {
    if (Oe.chrome && Oe.android && 'deleteContentBackward' == e.inputType) {
      var n = t.domChangeCount;
      setTimeout(function () {
        if (
          t.domChangeCount == n &&
          (t.dom.blur(),
          t.focus(),
          !t.someProp('handleKeyDown', function (e) {
            return e(t, $e(8, 'Backspace'));
          }))
        ) {
          var e = t.state.selection.$cursor;
          e &&
            e.pos > 0 &&
            t.dispatch(t.state.tr.delete(e.pos - 1, e.pos).scrollIntoView());
        }
      }, 50);
    }
  }),
  wr))
    yr[$r] = wr[$r];
  function jr(t, e) {
    if (t == e) return !0;
    for (var n in t) if (t[n] !== e[n]) return !1;
    for (var r in e) if (!(r in t)) return !1;
    return !0;
  }
  var Lr = function (t, e) {
    (this.spec = e || Ur), (this.side = this.spec.side || 0), (this.toDOM = t);
  };
  (Lr.prototype.map = function (t, e, n, r) {
    var o = t.mapResult(e.from + r, this.side < 0 ? -1 : 1),
      i = o.pos;
    return o.deleted ? null : new Wr(i - n, i - n, this);
  }),
    (Lr.prototype.valid = function () {
      return !0;
    }),
    (Lr.prototype.eq = function (t) {
      return (
        this == t ||
        (t instanceof Lr &&
          ((this.spec.key && this.spec.key == t.spec.key) ||
            (this.toDOM == t.toDOM && jr(this.spec, t.spec))))
      );
    });
  var Jr = function (t, e) {
    (this.spec = e || Ur), (this.attrs = t);
  };
  (Jr.prototype.map = function (t, e, n, r) {
    var o = t.map(e.from + r, this.spec.inclusiveStart ? -1 : 1) - n,
      i = t.map(e.to + r, this.spec.inclusiveEnd ? 1 : -1) - n;
    return o >= i ? null : new Wr(o, i, this);
  }),
    (Jr.prototype.valid = function (t, e) {
      return e.from < e.to;
    }),
    (Jr.prototype.eq = function (t) {
      return (
        this == t ||
        (t instanceof Jr && jr(this.attrs, t.attrs) && jr(this.spec, t.spec))
      );
    }),
    (Jr.is = function (t) {
      return t.type instanceof Jr;
    });
  var qr = function (t, e) {
    (this.spec = e || Ur), (this.attrs = t);
  };
  (qr.prototype.map = function (t, e, n, r) {
    var o = t.mapResult(e.from + r, 1);
    if (o.deleted) return null;
    var i = t.mapResult(e.to + r, -1);
    return i.deleted || i.pos <= o.pos
      ? null
      : new Wr(o.pos - n, i.pos - n, this);
  }),
    (qr.prototype.valid = function (t, e) {
      var n = t.content.findIndex(e.from),
        r = n.index,
        o = n.offset;
      return o == e.from && o + t.child(r).nodeSize == e.to;
    }),
    (qr.prototype.eq = function (t) {
      return (
        this == t ||
        (t instanceof qr && jr(this.attrs, t.attrs) && jr(this.spec, t.spec))
      );
    });
  var Wr = function (t, e, n) {
      (this.from = t), (this.to = e), (this.type = n);
    },
    Kr = { spec: { configurable: !0 }, inline: { configurable: !0 } };
  (Wr.prototype.copy = function (t, e) {
    return new Wr(t, e, this.type);
  }),
    (Wr.prototype.eq = function (t, e) {
      return (
        void 0 === e && (e = 0),
        this.type.eq(t.type) && this.from + e == t.from && this.to + e == t.to
      );
    }),
    (Wr.prototype.map = function (t, e, n) {
      return this.type.map(t, this, e, n);
    }),
    (Wr.widget = function (t, e, n) {
      return new Wr(t, t, new Lr(e, n));
    }),
    (Wr.inline = function (t, e, n, r) {
      return new Wr(t, e, new Jr(n, r));
    }),
    (Wr.node = function (t, e, n, r) {
      return new Wr(t, e, new qr(n, r));
    }),
    (Kr.spec.get = function () {
      return this.type.spec;
    }),
    (Kr.inline.get = function () {
      return this.type instanceof Jr;
    }),
    Object.defineProperties(Wr.prototype, Kr);
  var Hr = [],
    Ur = {},
    Gr = function (t, e) {
      (this.local = t && t.length ? t : Hr),
        (this.children = e && e.length ? e : Hr);
    };
  (Gr.create = function (t, e) {
    return e.length ? eo(e, t, 0, Ur) : Xr;
  }),
    (Gr.prototype.find = function (t, e, n) {
      var r = [];
      return this.findInner(null == t ? 0 : t, null == e ? 1e9 : e, r, 0, n), r;
    }),
    (Gr.prototype.findInner = function (t, e, n, r, o) {
      for (var i = 0; i < this.local.length; i++) {
        var s = this.local[i];
        s.from <= e &&
          s.to >= t &&
          (!o || o(s.spec)) &&
          n.push(s.copy(s.from + r, s.to + r));
      }
      for (var a = 0; a < this.children.length; a += 3)
        if (this.children[a] < e && this.children[a + 1] > t) {
          var c = this.children[a] + 1;
          this.children[a + 2].findInner(t - c, e - c, n, r + c, o);
        }
    }),
    (Gr.prototype.map = function (t, e, n) {
      return this == Xr || 0 == t.maps.length
        ? this
        : this.mapInner(t, e, 0, 0, n || Ur);
    }),
    (Gr.prototype.mapInner = function (t, e, n, r, o) {
      for (var i, s = 0; s < this.local.length; s++) {
        var a = this.local[s].map(t, n, r);
        a && a.type.valid(e, a)
          ? (i || (i = [])).push(a)
          : o.onRemove && o.onRemove(this.local[s].spec);
      }
      return this.children.length
        ? (function (t, e, n, r, o, i, s) {
            for (
              var a = t.slice(),
                c = function (t, e, n, r) {
                  for (var s = 0; s < a.length; s += 3) {
                    var c = a[s + 1],
                      h = void 0;
                    -1 == c ||
                      t > c + i ||
                      (e >= a[s] + i
                        ? (a[s + 1] = -1)
                        : n >= o &&
                          (h = r - n - (e - t)) &&
                          ((a[s] += h), (a[s + 1] += h)));
                  }
                },
                h = 0;
              h < n.maps.length;
              h++
            )
              n.maps[h].forEach(c);
            for (var p = !1, l = 0; l < a.length; l += 3)
              if (-1 == a[l + 1]) {
                var f = n.map(t[l] + i),
                  u = f - o;
                if (u < 0 || u >= r.content.size) {
                  p = !0;
                  continue;
                }
                var d = n.map(t[l + 1] + i, -1) - o,
                  m = r.content.findIndex(u),
                  v = m.index,
                  g = m.offset,
                  y = r.maybeChild(v);
                if (y && g == u && g + y.nodeSize == d) {
                  var w = a[l + 2].mapInner(n, y, f + 1, t[l] + i + 1, s);
                  w != Xr
                    ? ((a[l] = u), (a[l + 1] = d), (a[l + 2] = w))
                    : ((a[l + 1] = -2), (p = !0));
                } else p = !0;
              }
            if (p) {
              var b = eo(
                (function (t, e, n, r, o, i, s) {
                  function a(t, e) {
                    for (var i = 0; i < t.local.length; i++) {
                      var c = t.local[i].map(r, o, e);
                      c ? n.push(c) : s.onRemove && s.onRemove(t.local[i].spec);
                    }
                    for (var h = 0; h < t.children.length; h += 3)
                      a(t.children[h + 2], t.children[h] + e + 1);
                  }
                  for (var c = 0; c < t.length; c += 3)
                    -1 == t[c + 1] && a(t[c + 2], e[c] + i + 1);
                  return n;
                })(a, t, e || [], n, o, i, s),
                r,
                0,
                s,
              );
              e = b.local;
              for (var k = 0; k < a.length; k += 3)
                a[k + 1] < 0 && (a.splice(k, 3), (k -= 3));
              for (var S = 0, x = 0; S < b.children.length; S += 3) {
                for (var O = b.children[S]; x < a.length && a[x] < O; ) x += 3;
                a.splice(
                  x,
                  0,
                  b.children[S],
                  b.children[S + 1],
                  b.children[S + 2],
                );
              }
            }
            return new Gr(e && e.sort(no), a);
          })(this.children, i, t, e, n, r, o)
        : i
        ? new Gr(i.sort(no))
        : Xr;
    }),
    (Gr.prototype.add = function (t, e) {
      return e.length
        ? this == Xr
          ? Gr.create(t, e)
          : this.addInner(t, e, 0)
        : this;
    }),
    (Gr.prototype.addInner = function (t, e, n) {
      var r,
        o = this,
        i = 0;
      t.forEach(function (t, s) {
        var a,
          c = s + n;
        if ((a = Zr(e, t, c))) {
          for (r || (r = o.children.slice()); i < r.length && r[i] < s; )
            i += 3;
          r[i] == s
            ? (r[i + 2] = r[i + 2].addInner(t, a, c + 1))
            : r.splice(i, 0, s, s + t.nodeSize, eo(a, t, c + 1, Ur)),
            (i += 3);
        }
      });
      for (var s = Qr(i ? to(e) : e, -n), a = 0; a < s.length; a++)
        s[a].type.valid(t, s[a]) || s.splice(a--, 1);
      return new Gr(
        s.length ? this.local.concat(s).sort(no) : this.local,
        r || this.children,
      );
    }),
    (Gr.prototype.remove = function (t) {
      return 0 == t.length || this == Xr ? this : this.removeInner(t, 0);
    }),
    (Gr.prototype.removeInner = function (t, e) {
      for (var n = this.children, r = this.local, o = 0; o < n.length; o += 3) {
        for (
          var i = void 0, s = n[o] + e, a = n[o + 1] + e, c = 0, h = void 0;
          c < t.length;
          c++
        )
          (h = t[c]) &&
            h.from > s &&
            h.to < a &&
            ((t[c] = null), (i || (i = [])).push(h));
        if (i) {
          n == this.children && (n = this.children.slice());
          var p = n[o + 2].removeInner(i, s + 1);
          p != Xr ? (n[o + 2] = p) : (n.splice(o, 3), (o -= 3));
        }
      }
      if (r.length)
        for (var l = 0, f = void 0; l < t.length; l++)
          if ((f = t[l]))
            for (var u = 0; u < r.length; u++)
              r[u].eq(f, e) &&
                (r == this.local && (r = this.local.slice()), r.splice(u--, 1));
      return n == this.children && r == this.local
        ? this
        : r.length || n.length
        ? new Gr(r, n)
        : Xr;
    }),
    (Gr.prototype.forChild = function (t, e) {
      if (this == Xr) return this;
      if (e.isLeaf) return Gr.empty;
      for (var n, r, o = 0; o < this.children.length; o += 3)
        if (this.children[o] >= t) {
          this.children[o] == t && (n = this.children[o + 2]);
          break;
        }
      for (
        var i = t + 1, s = i + e.content.size, a = 0;
        a < this.local.length;
        a++
      ) {
        var c = this.local[a];
        if (c.from < s && c.to > i && c.type instanceof Jr) {
          var h = Math.max(i, c.from) - i,
            p = Math.min(s, c.to) - i;
          h < p && (r || (r = [])).push(c.copy(h, p));
        }
      }
      if (r) {
        var l = new Gr(r.sort(no));
        return n ? new Yr([l, n]) : l;
      }
      return n || Xr;
    }),
    (Gr.prototype.eq = function (t) {
      if (this == t) return !0;
      if (
        !(t instanceof Gr) ||
        this.local.length != t.local.length ||
        this.children.length != t.children.length
      )
        return !1;
      for (var e = 0; e < this.local.length; e++)
        if (!this.local[e].eq(t.local[e])) return !1;
      for (var n = 0; n < this.children.length; n += 3)
        if (
          this.children[n] != t.children[n] ||
          this.children[n + 1] != t.children[n + 1] ||
          !this.children[n + 2].eq(t.children[n + 2])
        )
          return !1;
      return !0;
    }),
    (Gr.prototype.locals = function (t) {
      return ro(this.localsInner(t));
    }),
    (Gr.prototype.localsInner = function (t) {
      if (this == Xr) return Hr;
      if (t.inlineContent || !this.local.some(Jr.is)) return this.local;
      for (var e = [], n = 0; n < this.local.length; n++)
        this.local[n].type instanceof Jr || e.push(this.local[n]);
      return e;
    });
  var Xr = new Gr();
  (Gr.empty = Xr), (Gr.removeOverlap = ro);
  var Yr = function (t) {
    this.members = t;
  };
  function Qr(t, e) {
    if (!e || !t.length) return t;
    for (var n = [], r = 0; r < t.length; r++) {
      var o = t[r];
      n.push(new Wr(o.from + e, o.to + e, o.type));
    }
    return n;
  }
  function Zr(t, e, n) {
    if (e.isLeaf) return null;
    for (var r = n + e.nodeSize, o = null, i = 0, s = void 0; i < t.length; i++)
      (s = t[i]) &&
        s.from > n &&
        s.to < r &&
        ((o || (o = [])).push(s), (t[i] = null));
    return o;
  }
  function to(t) {
    for (var e = [], n = 0; n < t.length; n++) null != t[n] && e.push(t[n]);
    return e;
  }
  function eo(t, e, n, r) {
    var o = [],
      i = !1;
    e.forEach(function (e, s) {
      var a = Zr(t, e, s + n);
      if (a) {
        i = !0;
        var c = eo(a, e, n + s + 1, r);
        c != Xr && o.push(s, s + e.nodeSize, c);
      }
    });
    for (var s = Qr(i ? to(t) : t, -n).sort(no), a = 0; a < s.length; a++)
      s[a].type.valid(e, s[a]) ||
        (r.onRemove && r.onRemove(s[a].spec), s.splice(a--, 1));
    return s.length || o.length ? new Gr(s, o) : Xr;
  }
  function no(t, e) {
    return t.from - e.from || t.to - e.to;
  }
  function ro(t) {
    for (var e = t, n = 0; n < e.length - 1; n++) {
      var r = e[n];
      if (r.from != r.to)
        for (var o = n + 1; o < e.length; o++) {
          var i = e[o];
          if (i.from != r.from) {
            i.from < r.to &&
              (e == t && (e = t.slice()),
              (e[n] = r.copy(r.from, i.from)),
              oo(e, o, r.copy(i.from, r.to)));
            break;
          }
          i.to != r.to &&
            (e == t && (e = t.slice()),
            (e[o] = i.copy(i.from, r.to)),
            oo(e, o + 1, i.copy(r.to, i.to)));
        }
    }
    return e;
  }
  function oo(t, e, n) {
    for (; e < t.length && no(n, t[e]) > 0; ) e++;
    t.splice(e, 0, n);
  }
  function io(t) {
    var e = [];
    return (
      t.someProp('decorations', function (n) {
        var r = n(t.state);
        r && r != Xr && e.push(r);
      }),
      t.cursorWrapper && e.push(Gr.create(t.state.doc, [t.cursorWrapper.deco])),
      Yr.from(e)
    );
  }
  (Yr.prototype.forChild = function (t, e) {
    if (e.isLeaf) return Gr.empty;
    for (var n = [], r = 0; r < this.members.length; r++) {
      var o = this.members[r].forChild(t, e);
      o != Xr && (o instanceof Yr ? (n = n.concat(o.members)) : n.push(o));
    }
    return Yr.from(n);
  }),
    (Yr.prototype.eq = function (t) {
      if (!(t instanceof Yr) || t.members.length != this.members.length)
        return !1;
      for (var e = 0; e < this.members.length; e++)
        if (!this.members[e].eq(t.members[e])) return !1;
      return !0;
    }),
    (Yr.prototype.locals = function (t) {
      for (var e, n = !0, r = 0; r < this.members.length; r++) {
        var o = this.members[r].localsInner(t);
        if (o.length)
          if (e) {
            n && ((e = e.slice()), (n = !1));
            for (var i = 0; i < o.length; i++) e.push(o[i]);
          } else e = o;
      }
      return e ? ro(n ? e : e.sort(no)) : Hr;
    }),
    (Yr.from = function (t) {
      switch (t.length) {
        case 0:
          return Xr;
        case 1:
          return t[0];
        default:
          return new Yr(t);
      }
    });
  var so = function (t, e) {
      (this._props = e),
        (this.state = e.state),
        (this.dispatch = this.dispatch.bind(this)),
        (this._root = null),
        (this.focused = !1),
        (this.trackWrites = null),
        (this.dom = (t && t.mount) || document.createElement('div')),
        t &&
          (t.appendChild
            ? t.appendChild(this.dom)
            : t.apply
            ? t(this.dom)
            : t.mount && (this.mounted = !0)),
        (this.editable = po(this)),
        (this.markCursor = null),
        (this.cursorWrapper = null),
        ho(this),
        (this.nodeViews = lo(this)),
        (this.docView = vn(this.state.doc, co(this), io(this), this.dom, this)),
        (this.lastSelectedViewDesc = null),
        (this.dragging = null),
        (function (t) {
          (t.shiftKey = !1),
            (t.mouseDown = null),
            (t.lastKeyCode = null),
            (t.lastKeyCodeTime = 0),
            (t.lastClick = { time: 0, x: 0, y: 0, type: '' }),
            (t.lastSelectionOrigin = null),
            (t.lastSelectionTime = 0),
            (t.lastIOSEnter = 0),
            (t.lastIOSEnterFallbackTimeout = null),
            (t.lastAndroidDelete = 0),
            (t.composing = !1),
            (t.composingTimeout = null),
            (t.compositionNodes = []),
            (t.compositionEndedAt = -2e8),
            (t.domObserver = new vr(t, function (e, n, r, i) {
              return (function (t, e, n, r, i) {
                if (e < 0) {
                  var s =
                      t.lastSelectionTime > Date.now() - 50
                        ? t.lastSelectionOrigin
                        : null,
                    a = Rn(t, s);
                  if (a && !t.state.selection.eq(a)) {
                    var c = t.state.tr.setSelection(a);
                    'pointer' == s
                      ? c.setMeta('pointer', !0)
                      : 'key' == s && c.scrollIntoView(),
                      t.dispatch(c);
                  }
                } else {
                  var h = t.state.doc.resolve(e),
                    p = h.sharedDepth(n);
                  (e = h.before(p + 1)),
                    (n = t.state.doc.resolve(n).after(p + 1));
                  var l = t.state.selection,
                    f = (function (t, e, n) {
                      var r = t.docView.parseRange(e, n),
                        o = r.node,
                        i = r.fromOffset,
                        s = r.toOffset,
                        a = r.from,
                        c = r.to,
                        h = t.root.getSelection(),
                        p = null,
                        l = h.anchorNode;
                      if (
                        (l &&
                          t.dom.contains(1 == l.nodeType ? l : l.parentNode) &&
                          ((p = [{ node: l, offset: h.anchorOffset }]),
                          _e(h) ||
                            p.push({
                              node: h.focusNode,
                              offset: h.focusOffset,
                            })),
                        Oe.chrome && 8 === t.lastKeyCode)
                      )
                        for (var f = s; f > i; f--) {
                          var u = o.childNodes[f - 1],
                            d = u.pmViewDesc;
                          if ('BR' == u.nodeName && !d) {
                            s = f;
                            break;
                          }
                          if (!d || d.size) break;
                        }
                      var m = t.state.doc,
                        v =
                          t.someProp('domParser') ||
                          rt.fromSchema(t.state.schema),
                        g = m.resolve(a),
                        y = null,
                        w = v.parse(o, {
                          topNode: g.parent,
                          topMatch: g.parent.contentMatchAt(g.index()),
                          topOpen: !0,
                          from: i,
                          to: s,
                          preserveWhitespace:
                            !g.parent.type.spec.code || 'full',
                          editableContent: !0,
                          findPositions: p,
                          ruleFromNode: er,
                          context: g,
                        });
                      if (p && null != p[0].pos) {
                        var b = p[0].pos,
                          k = p[1] && p[1].pos;
                        null == k && (k = b),
                          (y = { anchor: b + a, head: k + a });
                      }
                      return { doc: w, sel: y, from: a, to: c };
                    })(t, e, n);
                  if (
                    Oe.chrome &&
                    t.cursorWrapper &&
                    f.sel &&
                    f.sel.anchor == t.cursorWrapper.deco.from
                  ) {
                    var u = t.cursorWrapper.deco.type.toDOM.nextSibling,
                      d = u && u.nodeValue ? u.nodeValue.length : 1;
                    f.sel = {
                      anchor: f.sel.anchor + d,
                      head: f.sel.anchor + d,
                    };
                  }
                  var m,
                    v,
                    g = t.state.doc,
                    y = g.slice(f.from, f.to);
                  8 === t.lastKeyCode && Date.now() - 100 < t.lastKeyCodeTime
                    ? ((m = t.state.selection.to), (v = 'end'))
                    : ((m = t.state.selection.from), (v = 'start')),
                    (t.lastKeyCode = null);
                  var w = (function (t, e, n, r, o) {
                    var i = t.findDiffStart(e, n);
                    if (null == i) return null;
                    var s = t.findDiffEnd(e, n + t.size, n + e.size),
                      a = s.a,
                      c = s.b;
                    return (
                      'end' == o &&
                        (r -= a + Math.max(0, i - Math.min(a, c)) - i),
                      a < i && t.size < e.size
                        ? ((c = (i -= r <= i && r >= a ? i - r : 0) + (c - a)),
                          (a = i))
                        : c < i &&
                          ((a = (i -= r <= i && r >= c ? i - r : 0) + (a - c)),
                          (c = i)),
                      { start: i, endA: a, endB: c }
                    );
                  })(y.content, f.doc.content, f.from, m, v);
                  if (!w) {
                    if (
                      !(
                        r &&
                        l instanceof oe &&
                        !l.empty &&
                        l.$head.sameParent(l.$anchor)
                      ) ||
                      t.composing ||
                      (f.sel && f.sel.anchor != f.sel.head)
                    ) {
                      if (
                        ((Oe.ios && t.lastIOSEnter > Date.now() - 225) ||
                          Oe.android) &&
                        i.some(function (t) {
                          return 'DIV' == t.nodeName || 'P' == t.nodeName;
                        }) &&
                        t.someProp('handleKeyDown', function (e) {
                          return e(t, $e(13, 'Enter'));
                        })
                      )
                        return void (t.lastIOSEnter = 0);
                      if (f.sel) {
                        var b = nr(t, t.state.doc, f.sel);
                        b &&
                          !b.eq(t.state.selection) &&
                          t.dispatch(t.state.tr.setSelection(b));
                      }
                      return;
                    }
                    w = { start: l.from, endA: l.to, endB: l.to };
                  }
                  t.domChangeCount++,
                    t.state.selection.from < t.state.selection.to &&
                      w.start == w.endB &&
                      t.state.selection instanceof oe &&
                      (w.start > t.state.selection.from &&
                      w.start <= t.state.selection.from + 2
                        ? (w.start = t.state.selection.from)
                        : w.endA < t.state.selection.to &&
                          w.endA >= t.state.selection.to - 2 &&
                          ((w.endB += t.state.selection.to - w.endA),
                          (w.endA = t.state.selection.to))),
                    Oe.ie &&
                      Oe.ie_version <= 11 &&
                      w.endB == w.start + 1 &&
                      w.endA == w.start &&
                      w.start > f.from &&
                      '  ' ==
                        f.doc.textBetween(
                          w.start - f.from - 1,
                          w.start - f.from + 1,
                        ) &&
                      (w.start--, w.endA--, w.endB--);
                  var k,
                    S = f.doc.resolveNoCache(w.start - f.from),
                    x = f.doc.resolveNoCache(w.endB - f.from),
                    O = S.sameParent(x) && S.parent.inlineContent;
                  if (
                    ((Oe.ios &&
                      t.lastIOSEnter > Date.now() - 225 &&
                      (!O ||
                        i.some(function (t) {
                          return 'DIV' == t.nodeName || 'P' == t.nodeName;
                        }))) ||
                      (!O &&
                        S.pos < f.doc.content.size &&
                        (k = ee.findFrom(f.doc.resolve(S.pos + 1), 1, !0)) &&
                        k.head == x.pos)) &&
                    t.someProp('handleKeyDown', function (e) {
                      return e(t, $e(13, 'Enter'));
                    })
                  )
                    t.lastIOSEnter = 0;
                  else if (
                    t.state.selection.anchor > w.start &&
                    (function (t, e, n, r, o) {
                      if (
                        !r.parent.isTextblock ||
                        n - e <= o.pos - r.pos ||
                        rr(r, !0, !1) < o.pos
                      )
                        return !1;
                      var i = t.resolve(e);
                      if (
                        i.parentOffset < i.parent.content.size ||
                        !i.parent.isTextblock
                      )
                        return !1;
                      var s = t.resolve(rr(i, !0, !0));
                      return (
                        !(
                          !s.parent.isTextblock ||
                          s.pos > n ||
                          rr(s, !0, !1) < n
                        ) &&
                        r.parent.content
                          .cut(r.parentOffset)
                          .eq(s.parent.content)
                      );
                    })(g, w.start, w.endA, S, x) &&
                    t.someProp('handleKeyDown', function (e) {
                      return e(t, $e(8, 'Backspace'));
                    })
                  )
                    Oe.android &&
                      Oe.chrome &&
                      t.domObserver.suppressSelectionUpdates();
                  else {
                    Oe.chrome &&
                      Oe.android &&
                      w.toB == w.from &&
                      (t.lastAndroidDelete = Date.now()),
                      Oe.android &&
                        !O &&
                        S.start() != x.start() &&
                        0 == x.parentOffset &&
                        S.depth == x.depth &&
                        f.sel &&
                        f.sel.anchor == f.sel.head &&
                        f.sel.head == w.endA &&
                        ((w.endB -= 2),
                        (x = f.doc.resolveNoCache(w.endB - f.from)),
                        setTimeout(function () {
                          t.someProp('handleKeyDown', function (e) {
                            return e(t, $e(13, 'Enter'));
                          });
                        }, 20));
                    var M,
                      C,
                      N,
                      D,
                      T = w.start,
                      E = w.endA;
                    if (O)
                      if (S.pos == x.pos)
                        Oe.ie &&
                          Oe.ie_version <= 11 &&
                          0 == S.parentOffset &&
                          (t.domObserver.suppressSelectionUpdates(),
                          setTimeout(function () {
                            return Pn(t);
                          }, 20)),
                          (M = t.state.tr.delete(T, E)),
                          (C = g
                            .resolve(w.start)
                            .marksAcross(g.resolve(w.endA)));
                      else if (
                        w.endA == w.endB &&
                        (D = g.resolve(w.start)) &&
                        (N = (function (t, e) {
                          for (
                            var n,
                              r,
                              i,
                              s = t.firstChild.marks,
                              a = e.firstChild.marks,
                              c = s,
                              h = a,
                              p = 0;
                            p < a.length;
                            p++
                          )
                            c = a[p].removeFromSet(c);
                          for (var l = 0; l < s.length; l++)
                            h = s[l].removeFromSet(h);
                          if (1 == c.length && 0 == h.length)
                            (r = c[0]),
                              (n = 'add'),
                              (i = function (t) {
                                return t.mark(r.addToSet(t.marks));
                              });
                          else {
                            if (0 != c.length || 1 != h.length) return null;
                            (r = h[0]),
                              (n = 'remove'),
                              (i = function (t) {
                                return t.mark(r.removeFromSet(t.marks));
                              });
                          }
                          for (var f = [], u = 0; u < e.childCount; u++)
                            f.push(i(e.child(u)));
                          if (o.from(f).eq(t)) return { mark: r, type: n };
                        })(
                          S.parent.content.cut(S.parentOffset, x.parentOffset),
                          D.parent.content.cut(
                            D.parentOffset,
                            w.endA - D.start(),
                          ),
                        ))
                      )
                        (M = t.state.tr),
                          'add' == N.type
                            ? M.addMark(T, E, N.mark)
                            : M.removeMark(T, E, N.mark);
                      else if (
                        S.parent.child(S.index()).isText &&
                        S.index() == x.index() - (x.textOffset ? 0 : 1)
                      ) {
                        var A = S.parent.textBetween(
                          S.parentOffset,
                          x.parentOffset,
                        );
                        if (
                          t.someProp('handleTextInput', function (e) {
                            return e(t, T, E, A);
                          })
                        )
                          return;
                        M = t.state.tr.insertText(A, T, E);
                      }
                    if (
                      (M ||
                        (M = t.state.tr.replace(
                          T,
                          E,
                          f.doc.slice(w.start - f.from, w.endB - f.from),
                        )),
                      f.sel)
                    ) {
                      var R = nr(t, M.doc, f.sel);
                      R &&
                        !(
                          (Oe.chrome &&
                            Oe.android &&
                            t.composing &&
                            R.empty &&
                            (w.from != w.toB ||
                              t.lastAndroidDelete < Date.now() - 100) &&
                            (R.head == T || R.head == M.mapping.map(E) - 1)) ||
                          (Oe.ie && R.empty && R.head == T)
                        ) &&
                        M.setSelection(R);
                    }
                    C && M.ensureMarks(C), t.dispatch(M.scrollIntoView());
                  }
                }
              })(t, e, n, r, i);
            })),
            t.domObserver.start(),
            (t.domChangeCount = 0),
            (t.eventHandlers = Object.create(null));
          var e = function (e) {
            var n = yr[e];
            t.dom.addEventListener(
              e,
              (t.eventHandlers[e] = function (e) {
                !(function (t, e) {
                  if (!e.bubbles) return !0;
                  if (e.defaultPrevented) return !1;
                  for (var n = e.target; n != t.dom; n = n.parentNode)
                    if (
                      !n ||
                      11 == n.nodeType ||
                      (n.pmViewDesc && n.pmViewDesc.stopEvent(e))
                    )
                      return !1;
                  return !0;
                })(t, e) ||
                  Sr(t, e) ||
                  (!t.editable && e.type in wr) ||
                  n(t, e);
              }),
            );
          };
          for (var n in yr) e(n);
          Oe.safari &&
            t.dom.addEventListener('input', function () {
              return null;
            }),
            kr(t);
        })(this),
        (this.pluginViews = []),
        this.updatePluginViews();
    },
    ao = { props: { configurable: !0 }, root: { configurable: !0 } };
  function co(t) {
    var e = Object.create(null);
    return (
      (e.class = 'ProseMirror'),
      (e.contenteditable = String(t.editable)),
      t.someProp('attributes', function (n) {
        if (('function' == typeof n && (n = n(t.state)), n))
          for (var r in n)
            'class' == r
              ? (e.class += ' ' + n[r])
              : e[r] ||
                'contenteditable' == r ||
                'nodeName' == r ||
                (e[r] = String(n[r]));
      }),
      [Wr.node(0, t.state.doc.content.size, e)]
    );
  }
  function ho(t) {
    if (t.markCursor) {
      var e = document.createElement('img');
      e.setAttribute('mark-placeholder', 'true'),
        (t.cursorWrapper = {
          dom: e,
          deco: Wr.widget(t.state.selection.head, e, {
            raw: !0,
            marks: t.markCursor,
          }),
        });
    } else t.cursorWrapper = null;
  }
  function po(t) {
    return !t.someProp('editable', function (e) {
      return !1 === e(t.state);
    });
  }
  function lo(t) {
    var e = {};
    return (
      t.someProp('nodeViews', function (t) {
        for (var n in t)
          Object.prototype.hasOwnProperty.call(e, n) || (e[n] = t[n]);
      }),
      e
    );
  }
  (ao.props.get = function () {
    if (this._props.state != this.state) {
      var t = this._props;
      for (var e in ((this._props = {}), t)) this._props[e] = t[e];
      this._props.state = this.state;
    }
    return this._props;
  }),
    (so.prototype.update = function (t) {
      t.handleDOMEvents != this._props.handleDOMEvents && kr(this),
        (this._props = t),
        this.updateStateInner(t.state, !0);
    }),
    (so.prototype.setProps = function (t) {
      var e = {};
      for (var n in this._props) e[n] = this._props[n];
      for (var r in ((e.state = this.state), t)) e[r] = t[r];
      this.update(e);
    }),
    (so.prototype.updateState = function (t) {
      this.updateStateInner(t, this.state.plugins != t.plugins);
    }),
    (so.prototype.updateStateInner = function (t, e) {
      var n = this,
        r = this.state,
        o = !1,
        i = !1;
      if (
        (t.storedMarks && this.composing && (Pr(this), (i = !0)),
        (this.state = t),
        e)
      ) {
        var s = lo(this);
        (function (t, e) {
          var n = 0,
            r = 0;
          for (var o in t) {
            if (t[o] != e[o]) return !0;
            n++;
          }
          for (var i in e) r++;
          return n != r;
        })(s, this.nodeViews) && ((this.nodeViews = s), (o = !0)),
          kr(this);
      }
      (this.editable = po(this)), ho(this);
      var a = io(this),
        c = co(this),
        h = e
          ? 'reset'
          : t.scrollToSelection > r.scrollToSelection
          ? 'to selection'
          : 'preserve',
        p = o || !this.docView.matchesNode(t.doc, c, a);
      (!p && t.selection.eq(r.selection)) || (i = !0);
      var l,
        f,
        u,
        d,
        m,
        v,
        g,
        y,
        w,
        b,
        k =
          'preserve' == h &&
          i &&
          null == this.dom.style.overflowAnchor &&
          (function (t) {
            for (
              var e,
                n,
                r = t.dom.getBoundingClientRect(),
                o = Math.max(0, r.top),
                i = (r.left + r.right) / 2,
                s = o + 1;
              s < Math.min(innerHeight, r.bottom);
              s += 5
            ) {
              var a = t.root.elementFromPoint(i, s);
              if (a != t.dom && t.dom.contains(a)) {
                var c = a.getBoundingClientRect();
                if (c.top >= o - 20) {
                  (e = a), (n = c.top);
                  break;
                }
              }
            }
            return { refDOM: e, refTop: n, stack: We(t.dom) };
          })(this);
      if (i) {
        this.domObserver.stop();
        var S =
          p &&
          (Oe.ie || Oe.chrome) &&
          !this.composing &&
          !r.selection.empty &&
          !t.selection.empty &&
          ((l = r.selection),
          (f = t.selection),
          (u = Math.min(
            l.$anchor.sharedDepth(l.head),
            f.$anchor.sharedDepth(f.head),
          )),
          l.$anchor.start(u) != f.$anchor.start(u));
        if (p) {
          var x = Oe.chrome
            ? (this.trackWrites = this.root.getSelection().focusNode)
            : null;
          (!o && this.docView.update(t.doc, c, a, this)) ||
            (this.docView.updateOuterDeco([]),
            this.docView.destroy(),
            (this.docView = vn(t.doc, c, a, this.dom, this))),
            x && !this.trackWrites && (S = !0);
        }
        S ||
        !(
          this.mouseDown &&
          this.domObserver.currentSelection.eq(this.root.getSelection()) &&
          ((y = this),
          (w = y.docView.domFromPos(y.state.selection.anchor, 0)),
          (b = y.root.getSelection()),
          Pe(w.node, w.offset, b.anchorNode, b.anchorOffset))
        )
          ? Pn(this, S)
          : (_n(this, t.selection), this.domObserver.setCurSelection()),
          this.domObserver.start();
      }
      if ((this.updatePluginViews(r), 'reset' == h)) this.dom.scrollTop = 0;
      else if ('to selection' == h) {
        var O = this.root.getSelection().focusNode;
        this.someProp('handleScrollToSelection', function (t) {
          return t(n);
        }) ||
          (t.selection instanceof se
            ? qe(
                this,
                this.docView
                  .domAfterPos(t.selection.from)
                  .getBoundingClientRect(),
                O,
              )
            : qe(this, this.coordsAtPos(t.selection.head, 1), O));
      } else
        k &&
          ((m = (d = k).refDOM),
          (v = d.refTop),
          Ke(
            d.stack,
            0 == (g = m ? m.getBoundingClientRect().top : 0) ? 0 : g - v,
          ));
    }),
    (so.prototype.destroyPluginViews = function () {
      for (var t; (t = this.pluginViews.pop()); ) t.destroy && t.destroy();
    }),
    (so.prototype.updatePluginViews = function (t) {
      if (t && t.plugins == this.state.plugins)
        for (var e = 0; e < this.pluginViews.length; e++) {
          var n = this.pluginViews[e];
          n.update && n.update(this, t);
        }
      else {
        this.destroyPluginViews();
        for (var r = 0; r < this.state.plugins.length; r++) {
          var o = this.state.plugins[r];
          o.spec.view && this.pluginViews.push(o.spec.view(this));
        }
      }
    }),
    (so.prototype.someProp = function (t, e) {
      var n,
        r = this._props && this._props[t];
      if (null != r && (n = e ? e(r) : r)) return n;
      var o = this.state.plugins;
      if (o)
        for (var i = 0; i < o.length; i++) {
          var s = o[i].props[t];
          if (null != s && (n = e ? e(s) : s)) return n;
        }
    }),
    (so.prototype.hasFocus = function () {
      return this.root.activeElement == this.dom;
    }),
    (so.prototype.focus = function () {
      this.domObserver.stop(),
        this.editable &&
          (function (t) {
            if (t.setActive) return t.setActive();
            if (He) return t.focus(He);
            var e = We(t);
            t.focus(
              null == He
                ? {
                    get preventScroll() {
                      return (He = { preventScroll: !0 }), !0;
                    },
                  }
                : void 0,
            ),
              He || ((He = !1), Ke(e, 0));
          })(this.dom),
        Pn(this),
        this.domObserver.start();
    }),
    (ao.root.get = function () {
      var t = this._root;
      if (null == t)
        for (var e = this.dom.parentNode; e; e = e.parentNode)
          if (9 == e.nodeType || (11 == e.nodeType && e.host))
            return (
              e.getSelection ||
                (Object.getPrototypeOf(e).getSelection = function () {
                  return document.getSelection();
                }),
              (this._root = e)
            );
      return t || document;
    }),
    (so.prototype.posAtCoords = function (t) {
      return Ye(this, t);
    }),
    (so.prototype.coordsAtPos = function (t, e) {
      return void 0 === e && (e = 1), tn(this, t, e);
    }),
    (so.prototype.domAtPos = function (t, e) {
      return void 0 === e && (e = 0), this.docView.domFromPos(t, e);
    }),
    (so.prototype.nodeDOM = function (t) {
      var e = this.docView.descAt(t);
      return e ? e.nodeDOM : null;
    }),
    (so.prototype.posAtDOM = function (t, e, n) {
      void 0 === n && (n = -1);
      var r = this.docView.posFromDOM(t, e, n);
      if (null == r) throw new RangeError('DOM position not inside the editor');
      return r;
    }),
    (so.prototype.endOfTextblock = function (t, e) {
      return (function (t, e, n) {
        return sn == e && an == n
          ? cn
          : ((sn = e),
            (an = n),
            (cn =
              'up' == n || 'down' == n
                ? (function (t, e, n) {
                    var r = e.selection,
                      o = 'up' == n ? r.$from : r.$to;
                    return rn(t, e, function () {
                      for (
                        var e = t.docView.domFromPos(o.pos, 'up' == n ? -1 : 1)
                          .node;
                        ;

                      ) {
                        var r = t.docView.nearestDesc(e, !0);
                        if (!r) break;
                        if (r.node.isBlock) {
                          e = r.dom;
                          break;
                        }
                        e = r.dom.parentNode;
                      }
                      for (
                        var i = tn(t, o.pos, 1), s = e.firstChild;
                        s;
                        s = s.nextSibling
                      ) {
                        var a = void 0;
                        if (1 == s.nodeType) a = s.getClientRects();
                        else {
                          if (3 != s.nodeType) continue;
                          a = ze(s, 0, s.nodeValue.length).getClientRects();
                        }
                        for (var c = 0; c < a.length; c++) {
                          var h = a[c];
                          if (
                            h.bottom > h.top &&
                            ('up' == n
                              ? h.bottom < i.top + 1
                              : h.top > i.bottom - 1)
                          )
                            return !1;
                        }
                      }
                      return !0;
                    });
                  })(t, e, n)
                : (function (t, e, n) {
                    var r = e.selection.$head;
                    if (!r.parent.isTextblock) return !1;
                    var o = r.parentOffset,
                      i = !o,
                      s = o == r.parent.content.size,
                      a = getSelection();
                    return on.test(r.parent.textContent) && a.modify
                      ? rn(t, e, function () {
                          var e = a.getRangeAt(0),
                            o = a.focusNode,
                            i = a.focusOffset,
                            s = a.caretBidiLevel;
                          a.modify('move', n, 'character');
                          var c =
                            !(r.depth
                              ? t.docView.domAfterPos(r.before())
                              : t.dom
                            ).contains(
                              1 == a.focusNode.nodeType
                                ? a.focusNode
                                : a.focusNode.parentNode,
                            ) ||
                            (o == a.focusNode && i == a.focusOffset);
                          return (
                            a.removeAllRanges(),
                            a.addRange(e),
                            null != s && (a.caretBidiLevel = s),
                            c
                          );
                        })
                      : 'left' == n || 'backward' == n
                      ? i
                      : s;
                  })(t, e, n)));
      })(this, e || this.state, t);
    }),
    (so.prototype.destroy = function () {
      this.docView &&
        ((function (t) {
          for (var e in (t.domObserver.stop(), t.eventHandlers))
            t.dom.removeEventListener(e, t.eventHandlers[e]);
          clearTimeout(t.composingTimeout),
            clearTimeout(t.lastIOSEnterFallbackTimeout);
        })(this),
        this.destroyPluginViews(),
        this.mounted
          ? (this.docView.update(this.state.doc, [], io(this), this),
            (this.dom.textContent = ''))
          : this.dom.parentNode && this.dom.parentNode.removeChild(this.dom),
        this.docView.destroy(),
        (this.docView = null));
    }),
    (so.prototype.dispatchEvent = function (t) {
      return (function (t, e) {
        Sr(t, e) ||
          !yr[e.type] ||
          (!t.editable && e.type in wr) ||
          yr[e.type](t, e);
      })(this, t);
    }),
    (so.prototype.dispatch = function (t) {
      var e = this._props.dispatchTransaction;
      e ? e.call(this, t) : this.updateState(this.state.apply(t));
    }),
    Object.defineProperties(so.prototype, ao);
  const fo = ge.create({
    schema: Mt,
    doc: rt.fromSchema(Mt).parse(document.querySelector('#content')),
  });
  class uo {
    constructor(t) {
      (this.dom = document.createElement('h1')),
        (this.contentDOM = document.createElement('span')),
        this.dom.appendChild(this.contentDOM);
    }
    update(t) {
      return 'paragraph' === t.type.name;
    }
  }
  class mo {
    constructor(t, e, n) {
      (this.dom = document.createElement('div')),
        (this.p = document.createElement('p')),
        (this.p.style.fontSize = '14px'),
        this.updateParagraph(n);
      const r = document.createElement('img');
      (r.src = t.attrs.src),
        this.dom.appendChild(this.p),
        this.dom.appendChild(r),
        this.dom.addEventListener('click', (t) => {
          console.log('click with pos ' + n()), t.preventDefault();
        });
    }
    stopEvent() {
      return !0;
    }
    updateParagraph(t) {
      this.p.innerHTML = 'This is a custom node view at ' + t();
    }
    update(t, e, n) {
      return (
        console.log('update'),
        'image' === t.type.name && (this.updateParagraph(n), !0)
      );
    }
  }
  new so(document.querySelector('#editor'), {
    state: fo,
    nodeViews: {
      paragraph: (t) => new uo(t),
      image: (t, e, n) => new mo(t, e, n),
    },
  });
})();
//# sourceMappingURL=bundle.js.map
