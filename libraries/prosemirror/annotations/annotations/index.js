/**
 * @since 2021-04-22
 * @author vivaxy
 */
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Plugin, TextSelection, PluginKey } from 'prosemirror-state';

export const pluginKey = new PluginKey('annotation');

const ACTION_TYPE = {
  ADD_ANNOTATION: 'addAnnotation',
  DELETE_ANNOTATION: 'deleteAnnotation',
};

class Annotation {
  constructor(id, text) {
    this.id = id;
    this.text = text;
  }
}

function createDecoration(from, to, annotation) {
  return Decoration.inline(
    from,
    to,
    { class: 'annotation-highlight', ['data-id']: annotation.id },
    { annotation },
  );
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
        new Annotation(annotation.id, annotation.text),
      );
    });
    return new AnnotationState(DecorationSet.create(config.doc, decorations));
  }

  annotationsAt(pos) {
    // when at boundary, decorationSet.find(pos, pos) matches, decorationSet.find(pos + 1, pos - 1) not matches
    return this.decorationSet
      .find(pos + 1, pos - 1)
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
    const action = transaction.getMeta(annotationHighlightPlugin);
    const actionType = action?.type;
    if (!action && !transaction.docChanged) {
      return this;
    }
    let decorationSet = this.decorationSet.map(
      transaction.mapping,
      transaction.doc,
    );
    if (actionType === ACTION_TYPE.ADD_ANNOTATION) {
      decorationSet = decorationSet.add(transaction.doc, [
        createDecoration(action.from, action.to, action.annotation),
      ]);
    } else if (actionType === ACTION_TYPE.DELETE_ANNOTATION) {
      decorationSet = decorationSet.remove([
        this.findAnnotation(action.annotation.id),
      ]);
    }
    return new AnnotationState(decorationSet);
  }
}

export const annotationHighlightPlugin = new Plugin({
  key: pluginKey,
  state: {
    init: AnnotationState.init,
    apply(transaction, prevDecorationSet) {
      return prevDecorationSet.apply(transaction);
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
        if (selection.empty) {
          // when cursor at annotation, show annotation
          const annotations = annotationHighlightPlugin
            .getState(state)
            .annotationsAt(selection.from);
          if (!annotations.length) {
            return null;
          }
          return DecorationSet.create(state.doc, [
            Decoration.widget(
              selection.from,
              renderAnnotationTooltip(annotations, dispatch, state),
            ),
          ]);
        }
        if (!selection.annotationAdded) {
          // when select a text, ask for add an annotation
          return DecorationSet.create(state.doc, [
            Decoration.widget(
              selection.from,
              renderAnnotationHandle(dispatch, state),
            ),
          ]);
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
  $text.textContent = annotation.text;

  const $button = document.createElement('button');
  $button.classList.add('annotation-delete-button');
  $button.title = 'Delete annotation';
  $button.textContent = 'x';
  $button.addEventListener('click', function () {
    dispatch(
      state.tr.setMeta(annotationHighlightPlugin, {
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
  $button.addEventListener('click', function () {
    const text = prompt('Add annotation');
    if (text) {
      const { selection, tr } = state;
      // hide annotation handle when annotation is added
      selection.annotationAdded = true;
      tr.setSelection(new TextSelection(selection.$from));
      dispatch(
        tr.setMeta(annotationHighlightPlugin, {
          type: ACTION_TYPE.ADD_ANNOTATION,
          annotation: new Annotation(generateUUID(), text),
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
