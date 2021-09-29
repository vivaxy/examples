/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser, Fragment, Schema, Slice } from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';
import { Step, StepResult } from 'prosemirror-transform';

const schema = new Schema({
  nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
  marks: basicSchema.spec.marks,
});

class SetNodeAttrStep extends Step {
  constructor(from, to, attrs) {
    super();
    this.from = from;
    this.to = to;
    this.attrs = attrs;
  }

  apply(doc) {
    const oldSlice = doc.slice(this.from, this.to);
    if (
      oldSlice.content.content.length !== 1 ||
      !oldSlice.content.content[0].isBlock
    ) {
      return StepResult.fail('Invalid node range');
    }

    const oldNode = oldSlice.content.content[0];
    const node = oldNode.type.create(
      {
        ...oldNode.attrs,
        ...this.attrs,
      },
      oldNode.content,
      oldNode.marks,
    );
    return StepResult.fromReplace(
      doc,
      this.from,
      this.to,
      new Slice(new Fragment([node]), oldSlice.openStart, oldSlice.openEnd),
    );
  }

  invert(doc) {
    const oldSlice = doc.slice(this.from, this.to);
    console.assert(oldSlice.content.content.length === 1);
    return new SetNodeAttrStep(
      this.from,
      this.to,
      oldSlice.content.content[0].attrs,
    );
  }

  map(mapping) {
    const from = mapping.map(this.from, 1);
    const to = mapping.map(this.from, -1);
    return new SetNodeAttrStep(from, to, this.attrs);
  }

  toJSON() {
    return {
      stepType: 'setNodeAttr',
      attrs: this.attrs,
      from: this.from,
      to: this.to,
    };
  }

  static fromJSON(schema, json) {
    if (typeof json.from !== 'number' || typeof json.to !== 'number') {
      throw new RangeError('Invalid input for AddMarkStep.fromJSON');
    }
    return new SetNodeAttrStep(json.from, json.to, json.attrs);
  }
}

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
  plugins: exampleSetup({ schema }),
});

const view = new EditorView(document.querySelector('#editor'), {
  state,
});

document
  .getElementById('replace-node-attrs')
  .addEventListener('click', function () {
    view.dispatch(view.state.tr.step(new SetNodeAttrStep(0, 12, { level: 6 })));
  });
