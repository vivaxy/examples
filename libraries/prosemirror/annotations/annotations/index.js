/**
 * @since 2021-04-22
 * @author vivaxy
 */
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Plugin, TextSelection, PluginKey } from 'prosemirror-state';

export const annotationPluginKey = new PluginKey('annotation');

const ACTION_TYPE = {
  ADD_ANNOTATION: 'addAnnotation',
  DELETE_ANNOTATION: 'deleteAnnotation',
};

class Annotation {
  constructor(id, comment) {
    this.id = id;
    this.comment = comment;
  }
}

function createDecoration(from, to, annotation, type) {
  if (type === 'inline') {
    return Decoration.inline(
      from,
      to,
      {
        nodeName: 'span',
        class: 'annotation-highlight',
        'data-id': annotation.id,
      },
      { annotation },
    );
  } else if (type === 'node') {
    return Decoration.node(
      from,
      to,
      {
        class: 'annotation-highlight',
        'data-id': annotation.id,
      },
      { annotation },
    );
  }
}

class AnnotationState {
  constructor(decorationSet) {
    this.decorationSet = decorationSet;
  }

  static init(config) {
    const decorations = config.annotations.map(function (annotation) {
      return createDecoration(
        annotation.from,
        annotation.to,
        new Annotation(annotation.id, annotation.comment),
        annotation.type,
      );
    });
    return new AnnotationState(DecorationSet.create(config.doc, decorations));
  }

  annotationsAt(pos, inclusive) {
    // when at boundary, decorationSet.find(pos, pos) matches, decorationSet.find(pos + 1, pos - 1) not matches
    const offset = inclusive ? 0 : 1;
    return this.decorationSet
      .find(pos + offset, pos - offset)
      .map(function (decorations) {
        return decorations.spec.annotation;
      });
  }

  findAnnotation(id) {
    const current = this.decorationSet.find();
    for (let i = 0; i < current.length; i++) {
      if (current[i].spec.annotation.id === id) {
        return current[i];
      }
    }
  }

  apply(transaction) {
    const action = transaction.getMeta(annotationPlugin);
    const actionType = action?.type;
    if (!action && !transaction.docChanged) {
      return this;
    }
    let decorationSet = this.decorationSet.map(
      transaction.mapping,
      transaction.doc,
      {
        onRemove(spec) {
          console.log('removed', spec);
        },
      },
    );
    if (actionType === ACTION_TYPE.ADD_ANNOTATION) {
      decorationSet = decorationSet.add(transaction.doc, [
        createDecoration(
          action.from,
          action.to,
          action.annotation,
          action.decorationType,
        ),
      ]);
    } else if (actionType === ACTION_TYPE.DELETE_ANNOTATION) {
      decorationSet = decorationSet.remove([
        this.findAnnotation(action.annotation.id),
      ]);
    }
    return new AnnotationState(decorationSet);
  }

  toJSON() {
    return this.decorationSet.find().map(function (decoration) {
      const { id, comment } = decoration.spec.annotation;
      return {
        from: decoration.from,
        to: decoration.to,
        id,
        comment,
        type: decoration.inline ? 'inline' : 'node',
      };
    });
  }

  fromJSON(config) {
    return AnnotationState.init(config);
  }
}

export const annotationPlugin = new Plugin({
  key: annotationPluginKey,
  state: {
    init: AnnotationState.init,
    apply(transaction, prevAnnotationState, oldEditorState, newEditorState) {
      return prevAnnotationState.apply(transaction);
    },
    toJSON(annotationState) {
      return annotationState.toJSON();
    },
    fromJSON(config, annotationState, editorState) {
      return annotationState.fromJSON(config, editorState);
    },
  },
  props: {
    decorations(state) {
      return this.getState(state).decorationSet;
    },
  },
});

export function createAnnotationHandlePlugin(dispatch) {
  return new Plugin({
    props: {
      decorations(state) {
        const selection = state.selection;

        function getAnnotations(inclusive) {
          return annotationPlugin
            .getState(state)
            .annotationsAt(selection.from, inclusive);
        }

        // show add annotation button
        function createAnnotationHandle() {
          return DecorationSet.create(state.doc, [
            Decoration.widget(
              selection.from,
              renderAnnotationHandle(dispatch, state),
            ),
          ]);
        }

        // show annotation comment
        function createAnnotationTooltip(annotations) {
          return DecorationSet.create(state.doc, [
            Decoration.widget(
              selection.from,
              renderAnnotationTooltip(annotations, dispatch, state),
            ),
          ]);
        }

        if (selection.node) {
          const annotations = getAnnotations(true);
          if (!annotations.length) {
            return createAnnotationHandle();
          }
          return createAnnotationTooltip(annotations);
        }
        if (selection.empty) {
          const annotations = getAnnotations(false);
          if (!annotations.length) {
            return null;
          }
          return createAnnotationTooltip(annotations);
        }
        if (!selection.annotationAdded) {
          return createAnnotationHandle();
        }
      },
    },
  });
}

function renderAnnotationTooltip(annotations, dispatch, state) {
  const $tooltip = document.createElement('div');
  $tooltip.classList.add('annotation-tooltip');

  const $annotations = document.createElement('ul');
  $annotations.classList.add('annotation-tooltip-list');

  annotations.forEach(function (annotation) {
    const $annotation = renderAnnotation(annotation, dispatch, state);
    $annotations.appendChild($annotation);
  });

  $tooltip.appendChild($annotations);
  return $tooltip;
}

function renderAnnotation(annotation, dispatch, state) {
  const $annotation = document.createElement('li');
  $annotation.classList.add('annotation-tooltip-item');

  const $text = document.createElement('span');
  $text.textContent = annotation.comment;

  const $button = document.createElement('button');
  $button.classList.add('annotation-delete-button');
  $button.title = 'Delete annotation';
  $button.textContent = 'x';
  // use `mousedown` instead of `click` to execute before ProseMirror update the selection
  $button.addEventListener('mousedown', function () {
    dispatch(
      state.tr.setMeta(annotationPlugin, {
        type: ACTION_TYPE.DELETE_ANNOTATION,
        annotation,
      }),
    );
  });

  $annotation.appendChild($button);
  $annotation.appendChild($text);

  return $annotation;
}

function renderAnnotationHandle(dispatch, state) {
  const $handle = document.createElement('div');
  $handle.classList.add('annotation-handle');

  const $button = document.createElement('button');
  $button.classList.add('annotation-add-button');
  $button.textContent = 'Add annotation';
  // use `mousedown` instead of `click` to execute before ProseMirror update the selection
  $button.addEventListener('mousedown', function () {
    const comment = prompt('Add annotation');
    if (comment) {
      const { selection, tr } = state;
      // hide annotation handle when annotation is added
      selection.annotationAdded = true;
      tr.setSelection(new TextSelection(selection.$from));
      dispatch(
        tr.setMeta(annotationPlugin, {
          type: ACTION_TYPE.ADD_ANNOTATION,
          annotation: new Annotation(generateUUID(), comment),
          decorationType:
            selection instanceof TextSelection ? 'inline' : 'node',
          from: selection.from,
          to: selection.to,
        }),
      );
    }
  });

  $handle.appendChild($button);
  return $handle;
}

function generateUUID() {
  return `0000-${Date.now()}-${Math.floor(Math.random() * 0xffffffff)}`;
}
