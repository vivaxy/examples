/**
 * @since 2022-02-08
 * @author vivaxy
 */
const { Slice, Fragment } = require('prosemirror-model');
const { schema } = require('prosemirror-schema-basic');
const { ReplaceStep } = require('prosemirror-transform');
const { rebaseSteps } = require('../index');

const doc = schema.node('doc', null, [
  schema.node('paragraph', null, [schema.text('1234567890')]),
]);

function t(doc, steps, over, toBe) {
  expect(rebaseSteps(doc, steps, over).toString()).toBe(toBe);
}

test('delete + delete / insert:before', () => {
  const steps = [
    new ReplaceStep(1, 2, Slice.empty), // 234567890
    new ReplaceStep(1, 2, Slice.empty), // 34567890
  ];
  const over = [
    new ReplaceStep(1, 1, new Slice(new Fragment([schema.text('x')]), 0, 0)),
  ];
  t(doc, steps, over, 'doc(paragraph("x34567890"))');
});

test('delete + delete / insert:middle', () => {
  const steps = [
    new ReplaceStep(1, 2, Slice.empty), // 234567890
    new ReplaceStep(1, 2, Slice.empty), // 34567890
  ];
  const over = [
    new ReplaceStep(2, 2, new Slice(new Fragment([schema.text('x')]), 0, 0)),
  ];
  t(doc, steps, over, 'doc(paragraph("x34567890"))');
});

test('delete + delete:around / insert:middle', () => {
  const steps = [
    new ReplaceStep(2, 3, Slice.empty), // 134567890
    new ReplaceStep(1, 3, Slice.empty), // 4567890
  ];
  const over = [
    new ReplaceStep(2, 2, new Slice(new Fragment([schema.text('x')]), 0, 0)),
  ];
  t(doc, steps, over, 'doc(paragraph("4567890"))');
});

test('insert + delete:around / insert:middle', () => {
  const steps = [
    new ReplaceStep(2, 2, new Slice(new Fragment([schema.text('a')]), 0, 0)), // 1a234567890
    new ReplaceStep(1, 5, Slice.empty), // 4567890
  ];
  const over = [
    new ReplaceStep(3, 3, new Slice(new Fragment([schema.text('x')]), 0, 0)), // 12x34567890
  ];
  // TODO: better to be 'doc(paragraph("34567890"))'
  t(doc, steps, over, 'doc(paragraph("4567890"))');
});
