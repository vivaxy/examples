/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { DOMParser, Schema } from 'prosemirror-model';

function tag() {
  const schema = new Schema({
    nodes: {
      doc: {
        content: 'block+',
      },
      paragraph: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM: function toDOM() {
          return ['p', 0];
        },
      },
      text: {
        group: 'inline',
      },
    },
  });

  const input = '<p>ABC</p>';
  const $input = document.createElement('div');
  $input.innerHTML = input;
  const doc = DOMParser.fromSchema(schema).parse($input);
  console.log('tag', doc.toString());
}

function namespace() {
  const schema = new Schema({
    nodes: {
      doc: {
        content: 'block+',
      },
      paragraph: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p', namespace: 'http://www.w3.org/2000/svg/' }],
        toDOM: function toDOM() {
          return ['p', 0];
        },
      },
      heading: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p', namespace: 'http://www.w3.org/1999/xhtml' }],
        toDOM: function toDOM() {
          return ['p', 0];
        },
      },
      text: {
        group: 'inline',
      },
    },
  });

  const input = '<p>ABC</p>';
  const $input = document.createElementNS(
    'http://www.w3.org/1999/xhtml',
    'div',
  );
  $input.innerHTML = input;
  const doc = DOMParser.fromSchema(schema).parse($input);
  console.log('namespace', doc.toString());
}

function consuming() {
  const schema = new Schema({
    nodes: {
      doc: {
        content: 'block+',
      },
      h1: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p', consuming: false }],
        toDOM: function toDOM() {
          return ['p', 0];
        },
      },
      h2: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM: function toDOM() {
          return ['p', 0];
        },
      },
      text: {
        group: 'inline',
      },
    },
  });

  const input = '<p>ABC</p>';
  const $input = document.createElement('div');
  $input.innerHTML = input;
  const doc = DOMParser.fromSchema(schema).parse($input);
  console.log('tag', doc.toString());
}

tag();
namespace();
consuming();
