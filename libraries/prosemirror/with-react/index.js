/**
 * @since 2021-04-25
 * @author vivaxy
 */
import React from 'https://cdn.skypack.dev/react';
import ReactDOM from 'https://cdn.skypack.dev/react-dom';
import { EditorState } from 'https://cdn.skypack.dev/prosemirror-state';
import { schema } from 'https://cdn.skypack.dev/prosemirror-schema-basic';
import { EditorView } from 'https://cdn.skypack.dev/prosemirror-view';
import {
  DOMParser,
  DOMSerializer,
} from 'https://cdn.skypack.dev/prosemirror-model';

class App extends React.Component {
  constructor(props) {
    super(props);
    const html = '<p>My Editor</p>';
    const $transformContainer = document.createElement('div');
    $transformContainer.innerHTML = html;
    this.state = {
      editorState: EditorState.create({
        schema,
        doc: DOMParser.fromSchema(schema).parse($transformContainer),
      }),
    };

    this.editorView = null;
  }

  componentDidMount() {
    this.editorView = new EditorView(document.querySelector('#editor'), {
      state: this.state.editorState,
      dispatchTransaction: (transaction) => {
        const newState = this.editorView.state.apply(transaction);
        this.setState({
          editorState: newState,
        });
      },
    });
  }

  componentWillUnmount() {
    this.editorView = null;
  }

  componentDidUpdate() {
    this.editorView.updateState(this.state.editorState);
  }

  render() {
    const $fragment = DOMSerializer.fromSchema(schema).serializeFragment(
      this.state.editorState.doc,
    );
    const $transformContainer = document.createElement('div');
    $transformContainer.appendChild($fragment);

    return React.createElement('div', { className: 'container' }, [
      React.createElement('div', {
        id: 'content',
        dangerouslySetInnerHTML: {
          __html: $transformContainer.innerHTML,
        },
      }),
      React.createElement('div', { id: 'editor' }),
    ]);
  }
}

ReactDOM.render(React.createElement(App), document.querySelector('#app'));
