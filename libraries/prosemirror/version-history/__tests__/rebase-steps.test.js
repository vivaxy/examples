/**
 * @since 2021-10-22
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { Slice, Fragment } from 'prosemirror-model';
import { ReplaceStep } from 'prosemirror-transform';
import { EditorState } from 'prosemirror-state';
import { rebaseStepsWithApply, rebaseStepsWithoutApply } from '../history';

function runWithoutApply(steps, oDoc, insertStep, nDoc) {
  const state = EditorState.create({
    schema,
    doc: schema.node('doc', {}, [
      schema.node('paragraph', {}, [schema.text('1234567890')]),
    ]),
  });

  const _tr = state.tr;
  const stepsInfo = steps.map(function (step) {
    const doc = _tr.doc;
    const inverted = step.invert(_tr.doc);
    _tr.step(step);
    return { step, inverted, doc };
  });

  expect(_tr.doc.toString()).toBe(oDoc);

  const tr = state.tr;
  const rebasedStepsInfo = rebaseStepsWithoutApply(
    stepsInfo,
    [insertStep],
    tr,
    () => {},
  );

  rebasedStepsInfo.forEach(function (stepInfo) {
    tr.step(stepInfo.step);
  });

  expect(tr.doc.toString()).toBe(nDoc);
}

function runWithApply(steps, oDoc, insertStep, nDoc) {
  const state = EditorState.create({
    schema,
    doc: schema.node('doc', {}, [
      schema.node('paragraph', {}, [schema.text('1234567890')]),
    ]),
  });

  const tr = state.tr;
  const stepsInfo = steps.map(function (step) {
    const doc = tr.doc;
    const inverted = step.invert(doc);
    tr.step(step);
    return { step, inverted, doc };
  });

  expect(tr.doc.toString()).toBe(oDoc);

  rebaseStepsWithApply(
    stepsInfo,
    [insertStep],
    tr,
    () => {},
    () => {},
  );

  expect(tr.doc.toString()).toBe(nDoc);
}

const run = runWithApply;

describe('delete, delete', function () {
  test('before', function () {
    const steps = [
      new ReplaceStep(1, 2, Slice.empty),
      new ReplaceStep(2, 3, Slice.empty),
    ];
    const oDoc = 'doc(paragraph("24567890"))';
    const insertStep = new ReplaceStep(
      1,
      1,
      new Slice(new Fragment([schema.text('x')]), 0, 0),
    );
    const nDoc = 'doc(paragraph("x24567890"))';
    run(steps, oDoc, insertStep, nDoc);
  });

  test('middle 1', function () {
    const steps = [
      new ReplaceStep(1, 2, Slice.empty),
      new ReplaceStep(2, 3, Slice.empty),
    ];
    const oDoc = 'doc(paragraph("24567890"))';
    const insertStep = new ReplaceStep(
      2,
      2,
      new Slice(new Fragment([schema.text('x')]), 0, 0),
    );
    const nDoc = 'doc(paragraph("x24567890"))';
    run(steps, oDoc, insertStep, nDoc);
  });

  test('middle 2', function () {
    const steps = [
      new ReplaceStep(3, 4, Slice.empty),
      new ReplaceStep(1, 2, Slice.empty),
    ];
    const oDoc = 'doc(paragraph("24567890"))';
    const insertStep = new ReplaceStep(
      2,
      2,
      new Slice(new Fragment([schema.text('x')]), 0, 0),
    );
    const nDoc = 'doc(paragraph("x24567890"))';
    run(steps, oDoc, insertStep, nDoc);
  });
});

describe('insert, insert', function () {
  test('before', function () {
    const steps = [
      new ReplaceStep(1, 1, new Slice(new Fragment([schema.text('m')]), 0, 0)),
      new ReplaceStep(3, 3, new Slice(new Fragment([schema.text('n')]), 0, 0)),
    ];
    const oDoc = 'doc(paragraph("m1n234567890"))';
    const insertStep = new ReplaceStep(
      1,
      1,
      new Slice(new Fragment([schema.text('x')]), 0, 0),
    );
    const nDoc = 'doc(paragraph("xm1n234567890"))';
    run(steps, oDoc, insertStep, nDoc);
  });
});

describe('insert, delete', function () {
  test('before', function () {
    const steps = [
      new ReplaceStep(1, 1, new Slice(new Fragment([schema.text('m')]), 0, 0)),
      new ReplaceStep(3, 4, Slice.empty),
    ];
    const oDoc = 'doc(paragraph("m134567890"))';
    const insertStep = new ReplaceStep(
      1,
      1,
      new Slice(new Fragment([schema.text('x')]), 0, 0),
    );
    const nDoc = 'doc(paragraph("xm134567890"))';
    run(steps, oDoc, insertStep, nDoc);
  });

  test('delete across insert', function () {
    const steps = [
      new ReplaceStep(2, 2, new Slice(new Fragment([schema.text('m')]), 0, 0)),
      new ReplaceStep(1, 4, Slice.empty),
    ];
    const oDoc = 'doc(paragraph("34567890"))';
    const insertStep = new ReplaceStep(
      1,
      1,
      new Slice(new Fragment([schema.text('x')]), 0, 0),
    );
    const nDoc = 'doc(paragraph("x34567890"))';
    run(steps, oDoc, insertStep, nDoc);
  });

  test('delete across insert 2', function () {
    const steps = [
      new ReplaceStep(2, 2, new Slice(new Fragment([schema.text('m')]), 0, 0)),
      new ReplaceStep(1, 4, Slice.empty),
    ];
    const oDoc = 'doc(paragraph("34567890"))';
    const insertStep = new ReplaceStep(
      2,
      2,
      new Slice(new Fragment([schema.text('x')]), 0, 0),
    );
    const nDoc = 'doc(paragraph("34567890"))';
    run(steps, oDoc, insertStep, nDoc);
  });

  test('delete across insert 3', function () {
    const steps = [
      new ReplaceStep(2, 2, new Slice(new Fragment([schema.text('m')]), 0, 0)),
      new ReplaceStep(1, 4, Slice.empty),
    ];
    const oDoc = 'doc(paragraph("34567890"))';
    const insertStep = new ReplaceStep(
      3,
      3,
      new Slice(new Fragment([schema.text('x')]), 0, 0),
    );
    const nDoc = 'doc(paragraph("34567890"))';
    run(steps, oDoc, insertStep, nDoc);
  });

  test('delete across insert 4', function () {
    const steps = [
      new ReplaceStep(2, 2, new Slice(new Fragment([schema.text('m')]), 0, 0)),
      new ReplaceStep(1, 4, Slice.empty),
    ];
    const oDoc = 'doc(paragraph("34567890"))';
    const insertStep = new ReplaceStep(
      4,
      4,
      new Slice(new Fragment([schema.text('x')]), 0, 0),
    );
    const nDoc = 'doc(paragraph("3x4567890"))';
    run(steps, oDoc, insertStep, nDoc);
  });
});

describe('delete, insert', function () {
  test('before', function () {
    const steps = [
      new ReplaceStep(1, 4, Slice.empty),
      new ReplaceStep(2, 2, new Slice(new Fragment([schema.text('m')]), 0, 0)),
    ];
    const oDoc = 'doc(paragraph("4m567890"))';
    const insertStep = new ReplaceStep(
      1,
      1,
      new Slice(new Fragment([schema.text('x')]), 0, 0),
    );
    const nDoc = 'doc(paragraph("x4m567890"))';
    run(steps, oDoc, insertStep, nDoc);
  });

  test('middle', function () {
    const steps = [
      new ReplaceStep(1, 4, Slice.empty),
      new ReplaceStep(2, 2, new Slice(new Fragment([schema.text('m')]), 0, 0)),
    ];
    const oDoc = 'doc(paragraph("4m567890"))';
    const insertStep = new ReplaceStep(
      2,
      2,
      new Slice(new Fragment([schema.text('x')]), 0, 0),
    );
    const nDoc = 'doc(paragraph("4m567890"))';
    run(steps, oDoc, insertStep, nDoc);
  });
});
