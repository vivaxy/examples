/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView, DecorationSet, Decoration } from 'prosemirror-view';
import { Schema, Slice, Fragment } from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';
import { buildMenuItems, exampleSetup } from 'prosemirror-example-setup';
import { MenuItem } from 'prosemirror-menu';
import { ReplaceStep } from 'prosemirror-transform';

const schema = new Schema({
  nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
  marks: basicSchema.spec.marks.append({
    background: {
      attrs: {
        color: {},
      },
      excludes: '',
      parseDOM: [
        {
          tag: 'span',
          getAttrs(dom) {
            return { color: dom.getAttribute('background') };
          },
        },
      ],
      toDOM(node) {
        return ['span', { style: `background: ${node.attrs.color}` }, 0];
      },
    },
  }),
});

const ACTION_TYPE = {
  ADD_DECORATIONS: 'add-decorations',
};

function random(value) {
  return Math.floor(Math.random() * value);
}

function randomColor() {
  return random(256);
}

const decorationsPlugin = new Plugin({
  state: {
    init(_, { doc }) {
      return DecorationSet.create(doc, []);
    },
    apply(tr, decorationSet) {
      decorationSet = decorationSet.map(tr.mapping, tr.doc);
      const action = tr.getMeta(decorationsPlugin);
      if (action?.type === ACTION_TYPE.ADD_DECORATIONS) {
        decorationSet = decorationSet.add(tr.doc, action.decorations);
      }
      return decorationSet;
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});

const plugins = [
  ...exampleSetup({
    schema,
    menuContent: [
      ...buildMenuItems(schema).fullMenu,
      [
        new MenuItem({
          label: 'Create Document.',
          run(state, dispatch) {
            const paragraphCount = prompt('Paragraph count') || 1;
            const repeatCount = prompt('Repeat count') || 1;
            createDocument(state, dispatch, paragraphCount, repeatCount);
          },
        }),
        new MenuItem({
          label: 'Add Decorations.',
          run(state, dispatch) {
            const count = prompt('Decoration count') || 1;
            addDecorations(state, dispatch, count);
          },
        }),
        new MenuItem({
          label: 'Add Marks.',
          run(state, dispatch) {
            const count = prompt('Mark count') || 1;
            addMarks(state, dispatch, count);
          },
        }),
        new MenuItem({
          label: 'Map on Steps.',
          run(state, dispatch) {
            const count = prompt('Step count') || 1;
            mapOnSteps(state, dispatch, count);
          },
        }),
      ],
    ],
  }),
  decorationsPlugin,
];

function createDocument(state, dispatch, paragraphCount, repeatCount) {
  const tr = state.tr.replace(
    0,
    state.doc.content.size,
    new Slice(
      new Fragment(
        Array.from({ length: paragraphCount }, function () {
          return schema.node('paragraph', null, [
            schema.text('1234567890'.repeat(repeatCount)),
          ]);
        }),
      ),
      0,
      0,
    ),
  );
  dispatch(tr);
}

function getRandomParagraph(state) {
  return { p: state.doc.content.content[0], pos: 0 };
  // const pIndex = random(state.doc.content.content.length);
  // const p = state.doc.content.content[pIndex];
  // let pos = 0;
  // for (let i = 0; i < pIndex; i++) {
  //   pos += state.doc.content.content[i].nodeSize;
  // }
  // return { p, pos };
}

let lastPos = 0;

function getRandomPositionInAParagraph(p) {
  lastPos++;
  return { from: 0, to: lastPos };
  // const pos0 = random(p.content.size);
  // const pos1 = random(p.content.size);
  // let from = Math.min(pos0, pos1);
  // let to = Math.max(pos0, pos1);
  // if (from === to) {
  //   to++;
  // }
  // if (to >= p.content.size) {
  //   from--;
  //   to--;
  // }
  // return { from, to };
}

function addDecorations(state, dispatch, count) {
  const beginTime = performance.now();

  const decorations = Array.from({ length: count }, function () {
    const { p, pos } = getRandomParagraph(state);
    const { from, to } = getRandomPositionInAParagraph(p);

    return Decoration.inline(pos + from, pos + to, {
      style: `background: rgba(${randomColor()}, ${randomColor()}, ${randomColor()}, 0.1)`,
      nodeName: 'span',
    });
  });

  dispatch(
    state.tr.setMeta(decorationsPlugin, {
      type: ACTION_TYPE.ADD_DECORATIONS,
      decorations,
    }),
  );
  console.log(`Add ${count} decorations in ${performance.now() - beginTime}ms`);
}

function addMarks(state, dispatch, count) {
  const beginTime = performance.now();

  const tr = state.tr;
  for (let i = 0; i < count; i++) {
    const { p, pos } = getRandomParagraph(state);
    const { from, to } = getRandomPositionInAParagraph(p);
    tr.addMark(
      pos + from,
      pos + to,
      schema.mark('background', {
        color: `rgba(${randomColor()}, ${randomColor()}, ${randomColor()}, 0.1)`,
      }),
    );
  }
  dispatch(tr);

  console.log(`Add ${count} marks in ${performance.now() - beginTime}ms`);
}

function mapOnSteps(state, dispatch, count) {
  const tr = state.tr;
  while (tr.steps.length < count) {
    tr.maybeStep(
      new ReplaceStep(1, 1, new Slice(Fragment.from(schema.text('X')), 0, 0)),
    );
  }
  const decorationSet = decorationsPlugin.getState(state);
  const startTime = Date.now();
  decorationSet.map(tr.mapping, tr.doc);
  const cost = Date.now() - startTime;
  console.log(
    `Map ${decorationSet.find().length} on ${count} steps in ${cost}ms`,
  );
  dispatch(tr);
}

const state = EditorState.create({
  schema,
  doc: schema.node(
    'doc',
    null,
    Array.from({ length: 1 }, function () {
      return schema.node('paragraph', null, [
        schema.text('1234567890'.repeat(10000)),
      ]);
    }),
  ),
  plugins,
});

const view = new EditorView(document.querySelector('#editor'), {
  state,
});

window.editorView = view;
