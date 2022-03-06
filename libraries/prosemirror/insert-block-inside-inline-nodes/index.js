/**
 * @since 2022-03-06
 * @author vivaxy
 */
const { Slice, Fragment } = require('prosemirror-model');
const { schema } = require('prosemirror-schema-basic');
const { ReplaceStep } = require('prosemirror-transform');

const doc = schema.node('doc', null, [
  schema.node('paragraph', null, [schema.text('12')]),
]);

const step = new ReplaceStep(
  2,
  2,
  new Slice(Fragment.from(schema.node('paragraph')), 0, 0),
);

console.log(step.apply(doc));
