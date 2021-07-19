/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { DOMParser, Schema, Fragment } from 'prosemirror-model';

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

function context() {
  const schema = new Schema({
    nodes: {
      doc: {
        content: 'block+',
      },
      blockquote: {
        content: 'block+',
        group: 'block',
        parseDOM: [{ tag: 'blockquote' }],
        toDOM() {
          return ['blockquote', 0];
        },
      },
      paragraph_in_blockquote: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p', context: 'blockquote/' }],
        toDOM() {
          return ['p', 0];
        },
      },
      paragraph: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM() {
          return ['p', 0];
        },
      },
      text: {
        group: 'inline',
      },
    },
  });

  const input = '<blockquote><p>A</p></blockquote><p>B</p>';
  const $input = document.createElement('div');
  $input.innerHTML = input;
  const doc = DOMParser.fromSchema(schema).parse($input);
  console.log('context', doc.toString());
}

function ignore() {
  const schema = new Schema({
    nodes: {
      doc: {
        content: 'block+',
      },
      blockquote: {
        content: 'block+',
        group: 'block',
        parseDOM: [{ tag: 'blockquote', ignore: true }],
        toDOM() {
          return ['blockquote', 0];
        },
      },
      paragraph: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM() {
          return ['p', 0];
        },
      },
      text: {
        group: 'inline',
      },
    },
  });

  const input = '<blockquote><p>A</p></blockquote><p>B</p>';
  const $input = document.createElement('div');
  $input.innerHTML = input;
  const doc = DOMParser.fromSchema(schema).parse($input);
  console.log('ignore', doc.toString());
}

function skip() {
  const schema = new Schema({
    nodes: {
      doc: {
        content: 'block+',
      },
      blockquote: {
        content: 'block+',
        group: 'block',
        parseDOM: [{ tag: 'blockquote', skip: true }],
        toDOM() {
          return ['blockquote', 0];
        },
      },
      paragraph: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM() {
          return ['p', 0];
        },
      },
      text: {
        group: 'inline',
      },
    },
  });

  const input = '<blockquote><p>A</p></blockquote><p>B</p>';
  const $input = document.createElement('div');
  $input.innerHTML = input;
  const doc = DOMParser.fromSchema(schema).parse($input);
  console.log('skip', doc.toString());
}

function contentElement() {
  const schema = new Schema({
    nodes: {
      doc: {
        content: 'block+',
      },
      paragraph: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p', contentElement: '[class="is-content"]' }],
        toDOM() {
          return ['p', 0];
        },
      },
      text: {
        group: 'inline',
      },
    },
  });

  const input =
    '<p><span class="not-content">???</span><span class="is-content">ABC</span></p>';
  const $input = document.createElement('div');
  $input.innerHTML = input;
  const doc = DOMParser.fromSchema(schema).parse($input);
  console.log('contentElement', doc.toString());
}

function getContent() {
  const schema = new Schema({
    nodes: {
      doc: {
        content: 'block+',
      },
      paragraph: {
        content: 'inline*',
        group: 'block',
        parseDOM: [
          {
            tag: 'p',
            getContent(node, _schema) {
              return new Fragment([
                _schema.text(node.querySelector('.is-content').textContent),
              ]);
            },
          },
        ],
        toDOM() {
          return ['p', 0];
        },
      },
      text: {
        group: 'inline',
      },
    },
  });

  const input =
    '<p><span class="not-content">???</span><span class="is-content">ABC</span></p>';
  const $input = document.createElement('div');
  $input.innerHTML = input;
  const doc = DOMParser.fromSchema(schema).parse($input);
  console.log('contentElement', doc.toString());
}

tag();
namespace();
consuming();
context();
ignore();
skip();
contentElement();
getContent();
