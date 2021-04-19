/**
 * @since 2021-04-19
 * @author vivaxy
 */
const r = new Range();
r.setStart(div, 0);
r.setEnd(div, 1);
let h = new Highlight(r);
CSS.highlights.set('foo', h);
CSS.highlights.set('bar', h);
