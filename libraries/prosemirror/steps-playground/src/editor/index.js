/**
 * @since 2021-09-28
 * @author vivaxy
 */
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser, Schema } from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';

let view = null;
let initialState = null;

export default {
  init({ $editor, $content }, { onSteps }) {
    console.assert(!view, 'Editor already initialized');
    const schema = new Schema({
      nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
      marks: basicSchema.spec.marks,
    });

    initialState = EditorState.create({
      schema,
      doc: DOMParser.fromSchema(schema).parse($content),
      plugins: exampleSetup({ schema }),
    });

    view = new EditorView($editor, {
      state: initialState,
      dispatchTransaction(tr) {
        if (tr.docChanged) {
          onSteps(
            tr.steps.map(function (step) {
              const s = step.toJSON();
              switch (s.stepType) {
                case 'replace':
                case 'replaceAround':
                  return {
                    ...s,
                    slice: step.slice.content.toString(),
                    openStart: step.slice.openStart,
                    openEnd: step.slice.openEnd,
                  };
                case 'addMark':
                case 'removeMark':
                  const attrs = Object.keys(s.mark.attrs || {})
                    .map(function (attrKey) {
                      return `${attrKey}="${s.mark.attrs[attrKey]}"`;
                    })
                    .join(' ');
                  return {
                    ...s,
                    mark: `<${s.mark.type}${attrs ? ' ' + attrs : ''}>`,
                  };
                default:
                  console.assert(false, 'Unexpected');
                  return null;
              }
            }),
          );
        }
        view.updateState(view.state.apply(tr));
      },
    });
  },

  destroy() {
    console.assert(view, 'Editor not initialized');
    view.destroy();
  },
};
