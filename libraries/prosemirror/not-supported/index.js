/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { DOMParser, Schema } from 'prosemirror-model';

const schema = new Schema({
  nodes: {
    doc: {
      content: 'block+',
    },
    text: {
      group: 'inline',
    },
    paragraph: {
      content: 'inline*',
      group: 'block',
      parseDOM: [
        {
          tag: 'p',
        },
      ],
      toDOM: function (node) {
        return ['p', 0];
      },
    },
  },
});

function parseFromHTML() {
  const dom = document.querySelector('#content');
  const doc = DOMParser.fromSchema(schema).parse(dom);
  console.log(doc.toJSON());
}

function parseFromJSON() {
  const json = {
    type: 'doc',
    content: [
      {
        type: 'yyy',
        content: [
          {
            type: 'text',
            text: '123',
            marks: [
              {
                type: 'xx',
              },
            ],
          },
        ],
      },
    ],
  };
  const doc = schema.nodeFromJSON(json);
  console.log(doc);
}

parseFromHTML();
parseFromJSON();
