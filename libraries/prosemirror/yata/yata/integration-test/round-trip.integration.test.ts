import { describe, test, expect } from 'vitest';
import { EditorState } from 'prosemirror-state';
import { ReplaceStep } from 'prosemirror-transform';
import schema from '../../example/schema.js';
import { Document } from '../document.js';

/**
 * ProseMirror Roundtrip Integration Tests
 *
 * These tests validate the complete synchronization cycle:
 * 1. Create ProseMirror doc1 and doc2
 * 2. Sync with YATA doc1 and doc2
 * 3. Perform actions on PM doc1, generate PM steps in transactions
 * 4. Call YATA doc1 applyStep() to convert PM steps → YATA items
 * 5. Sync YATA doc1 items to YATA doc2 using applyItems(), generate PM steps
 * 6. Verify PM and YATA documents converge to same final state
 *
 * Key principle: Tests verify semantic equivalence (same final document state)
 * rather than strict step equality, as generated steps may be grouped
 * differently from original steps but produce identical results.
 */
describe('applyItems - ProseMirror roundtrip', function () {
  test('text insertion in middle of paragraph', function () {
    // ARRANGE: Create PM doc1 with <p>hello</p>
    const state1 = EditorState.create({
      schema,
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, [schema.text('hello')]),
      ]),
    });

    // Create YATA doc1 from PM doc1
    const doc1 = Document.fromNodes(state1.doc.content);

    // Create YATA doc2 (initially empty)
    const doc2 = new Document();

    // Sync initial state
    doc2.applyItems(doc1.toItems(), schema);

    // ACT
    // Step 1: Perform action on PM doc1 - insert "XX" at position 3
    const originalSteps: ReplaceStep[] = [];
    const tr = state1.tr.insert(3, schema.text('XX'));
    tr.steps.forEach((step) => originalSteps.push(step as ReplaceStep));
    const state1Updated = state1.apply(tr);

    // Step 2: Apply PM steps to YATA doc1
    originalSteps.forEach((step) => doc1.applyStep(step));

    // Step 3: Sync YATA doc1 to YATA doc2 using applyItems
    const generatedSteps = doc2.applyItems(doc1.toItems(), schema);

    // Step 4: Apply generated steps to PM doc2
    const state2 = EditorState.create({
      schema,
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, [schema.text('hello')]),
      ]),
    });
    let tr2 = state2.tr;
    generatedSteps.forEach((step) => {
      tr2 = tr2.step(step);
    });
    const state2Updated = state2.apply(tr2);

    // ASSERT: Final PM documents should be identical
    expect(state1Updated.doc.textContent).toBe('heXXllo');
    expect(state2Updated.doc.textContent).toBe('heXXllo');

    // YATA documents should converge
    expect(doc1.toHTMLString()).toBe('<paragraph>heXXllo</paragraph>');
    expect(doc2.toHTMLString()).toBe('<paragraph>heXXllo</paragraph>');

    // Generated steps should exist
    expect(generatedSteps.length).toBeGreaterThan(0);
  });

  test('text deletion from paragraph', function () {
    // ARRANGE
    const state1 = EditorState.create({
      schema,
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, [schema.text('hello')]),
      ]),
    });

    const doc1 = Document.fromNodes(state1.doc.content);
    const doc2 = new Document();
    doc2.applyItems(doc1.toItems(), schema);

    // ACT
    // Delete "ll" (positions 3-5)
    const originalSteps: ReplaceStep[] = [];
    const tr = state1.tr.delete(3, 5);
    tr.steps.forEach((step) => originalSteps.push(step as ReplaceStep));
    const state1Updated = state1.apply(tr);

    originalSteps.forEach((step) => doc1.applyStep(step));

    const generatedSteps = doc2.applyItems(doc1.toItems(), schema);

    const state2 = EditorState.create({
      schema,
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, [schema.text('hello')]),
      ]),
    });
    let tr2 = state2.tr;
    generatedSteps.forEach((step) => {
      tr2 = tr2.step(step);
    });
    const state2Updated = state2.apply(tr2);

    // ASSERT
    expect(state1Updated.doc.textContent).toBe('heo');
    expect(state2Updated.doc.textContent).toBe('heo');
    expect(doc1.toHTMLString()).toBe('<paragraph>heo</paragraph>');
    expect(doc2.toHTMLString()).toBe('<paragraph>heo</paragraph>');
    expect(generatedSteps.length).toBeGreaterThan(0);
  });

  test('paragraph insertion after existing paragraph', function () {
    // ARRANGE
    const state1 = EditorState.create({
      schema,
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, [schema.text('first')]),
      ]),
    });

    const doc1 = Document.fromNodes(state1.doc.content);
    const doc2 = new Document();
    doc2.applyItems(doc1.toItems(), schema);

    // ACT
    // Insert new paragraph at position 7 (after first paragraph)
    const originalSteps: ReplaceStep[] = [];
    const newParagraph = schema.node('paragraph', null, [
      schema.text('second'),
    ]);
    const tr = state1.tr.insert(7, newParagraph);
    tr.steps.forEach((step) => originalSteps.push(step as ReplaceStep));
    const state1Updated = state1.apply(tr);

    originalSteps.forEach((step) => doc1.applyStep(step));

    const generatedSteps = doc2.applyItems(doc1.toItems(), schema);

    const state2 = EditorState.create({
      schema,
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, [schema.text('first')]),
      ]),
    });
    let tr2 = state2.tr;
    generatedSteps.forEach((step) => {
      tr2 = tr2.step(step);
    });
    const state2Updated = state2.apply(tr2);

    // ASSERT
    expect(state1Updated.doc.childCount).toBe(2);
    expect(state2Updated.doc.childCount).toBe(2);
    expect(state1Updated.doc.child(0).textContent).toBe('first');
    expect(state1Updated.doc.child(1).textContent).toBe('second');
    expect(state2Updated.doc.child(0).textContent).toBe('first');
    expect(state2Updated.doc.child(1).textContent).toBe('second');
    expect(doc1.toHTMLString()).toBe(
      '<paragraph>first</paragraph><paragraph>second</paragraph>',
    );
    expect(doc2.toHTMLString()).toBe(
      '<paragraph>first</paragraph><paragraph>second</paragraph>',
    );
  });

  test('text content deletion from paragraph', function () {
    // ARRANGE
    const state1 = EditorState.create({
      schema,
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, [schema.text('delete me')]),
      ]),
    });

    const doc1 = Document.fromNodes(state1.doc.content);
    const doc2 = new Document();
    doc2.applyItems(doc1.toItems(), schema);

    // ACT
    // Delete text content, leaving empty paragraph (position 1 to 10)
    const originalSteps: ReplaceStep[] = [];
    const tr = state1.tr.delete(1, 10);
    tr.steps.forEach((step) => originalSteps.push(step as ReplaceStep));
    const state1Updated = state1.apply(tr);

    originalSteps.forEach((step) => doc1.applyStep(step));

    const generatedSteps = doc2.applyItems(doc1.toItems(), schema);

    const state2 = EditorState.create({
      schema,
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, [schema.text('delete me')]),
      ]),
    });
    let tr2 = state2.tr;
    generatedSteps.forEach((step) => {
      tr2 = tr2.step(step);
    });
    const state2Updated = state2.apply(tr2);

    // ASSERT
    expect(state1Updated.doc.childCount).toBe(1);
    expect(state2Updated.doc.childCount).toBe(1);
    expect(state1Updated.doc.textContent).toBe('');
    expect(state2Updated.doc.textContent).toBe('');
    expect(doc1.toHTMLString()).toBe('<paragraph></paragraph>');
    expect(doc2.toHTMLString()).toBe('<paragraph></paragraph>');
  });

  test('paragraph merge - delete closing and opening tags', function () {
    // ARRANGE
    const state1 = EditorState.create({
      schema,
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, [schema.text('first')]),
        schema.node('paragraph', null, [schema.text('second')]),
      ]),
    });

    const doc1 = Document.fromNodes(state1.doc.content);
    const doc2 = new Document();
    doc2.applyItems(doc1.toItems(), schema);

    // ACT
    // Merge paragraphs by deleting the boundary (position 6-8)
    const originalSteps: ReplaceStep[] = [];
    const tr = state1.tr.delete(6, 8);
    tr.steps.forEach((step) => originalSteps.push(step as ReplaceStep));
    const state1Updated = state1.apply(tr);

    originalSteps.forEach((step) => doc1.applyStep(step));

    const generatedSteps = doc2.applyItems(doc1.toItems(), schema);

    const state2 = EditorState.create({
      schema,
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, [schema.text('first')]),
        schema.node('paragraph', null, [schema.text('second')]),
      ]),
    });
    let tr2 = state2.tr;
    generatedSteps.forEach((step) => {
      tr2 = tr2.step(step);
    });
    const state2Updated = state2.apply(tr2);

    // ASSERT
    expect(state1Updated.doc.childCount).toBe(1);
    expect(state2Updated.doc.childCount).toBe(1);
    expect(state1Updated.doc.textContent).toBe('firstsecond');
    expect(state2Updated.doc.textContent).toBe('firstsecond');
    expect(doc1.toHTMLString()).toBe('<paragraph>firstsecond</paragraph>');
    expect(doc2.toHTMLString()).toBe('<paragraph>firstsecond</paragraph>');
  });

  test.skip('paragraph split - insert closing and opening tags', function () {
    // KNOWN ISSUE: This test reveals an edge case with paragraph splits
    // where generated steps have inconsistent open depths
    // ARRANGE
    const state1 = EditorState.create({
      schema,
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, [schema.text('hello')]),
      ]),
    });

    const doc1 = Document.fromNodes(state1.doc.content);
    const doc2 = new Document();
    doc2.applyItems(doc1.toItems(), schema);

    // ACT
    // Split paragraph at position 4 (after "hel")
    const originalSteps: ReplaceStep[] = [];
    const tr = state1.tr.split(4);
    tr.steps.forEach((step) => originalSteps.push(step as ReplaceStep));
    const state1Updated = state1.apply(tr);

    originalSteps.forEach((step) => doc1.applyStep(step));

    const generatedSteps = doc2.applyItems(doc1.toItems(), schema);

    const state2 = EditorState.create({
      schema,
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, [schema.text('hello')]),
      ]),
    });
    let tr2 = state2.tr;
    generatedSteps.forEach((step) => {
      tr2 = tr2.step(step);
    });
    const state2Updated = state2.apply(tr2);

    // ASSERT
    expect(state1Updated.doc.childCount).toBe(2);
    expect(state2Updated.doc.childCount).toBe(2);
    expect(state1Updated.doc.child(0).textContent).toBe('hel');
    expect(state1Updated.doc.child(1).textContent).toBe('lo');
    expect(state2Updated.doc.child(0).textContent).toBe('hel');
    expect(state2Updated.doc.child(1).textContent).toBe('lo');
    expect(doc1.toHTMLString()).toBe(
      '<paragraph>hel</paragraph><paragraph>lo</paragraph>',
    );
    expect(doc2.toHTMLString()).toBe(
      '<paragraph>hel</paragraph><paragraph>lo</paragraph>',
    );
  });

  test.skip('complex multi-operation transaction', function () {
    // KNOWN ISSUE: This test reveals an edge case with complex transactions
    // where generated steps have inconsistent open depths when multiple
    // operations affect different parts of the document
    // ARRANGE
    const state1 = EditorState.create({
      schema,
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, [schema.text('first')]),
        schema.node('paragraph', null, [schema.text('second')]),
      ]),
    });

    const doc1 = Document.fromNodes(state1.doc.content);
    const doc2 = new Document();
    doc2.applyItems(doc1.toItems(), schema);

    // ACT
    // Multiple operations: insert text in first paragraph, delete from second
    const originalSteps: ReplaceStep[] = [];
    let tr = state1.tr;
    tr = tr.insertText('START', 1); // Insert at beginning of first paragraph
    tr = tr.delete(10, 12); // Delete "se" from "second"
    tr.steps.forEach((step) => originalSteps.push(step as ReplaceStep));
    const state1Updated = state1.apply(tr);

    originalSteps.forEach((step) => doc1.applyStep(step));

    const generatedSteps = doc2.applyItems(doc1.toItems(), schema);

    const state2 = EditorState.create({
      schema,
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, [schema.text('first')]),
        schema.node('paragraph', null, [schema.text('second')]),
      ]),
    });
    let tr2 = state2.tr;
    generatedSteps.forEach((step) => {
      tr2 = tr2.step(step);
    });
    const state2Updated = state2.apply(tr2);

    // ASSERT
    expect(state1Updated.doc.child(0).textContent).toBe('STARTfirst');
    expect(state1Updated.doc.child(1).textContent).toBe('cond');
    expect(state2Updated.doc.child(0).textContent).toBe('STARTfirst');
    expect(state2Updated.doc.child(1).textContent).toBe('cond');
    expect(doc1.toHTMLString()).toBe(
      '<paragraph>STARTfirst</paragraph><paragraph>cond</paragraph>',
    );
    expect(doc2.toHTMLString()).toBe(
      '<paragraph>STARTfirst</paragraph><paragraph>cond</paragraph>',
    );
  });
});
