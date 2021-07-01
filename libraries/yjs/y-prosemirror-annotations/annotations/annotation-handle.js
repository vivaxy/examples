/**
 * @since 2021-06-30
 * @author vivaxy
 */
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Plugin, TextSelection } from 'prosemirror-state';
import {
  annotationPluginKey,
  annotationHandlePluginKey,
  ACTION_TYPE,
} from './common';

export function createAnnotationHandlePlugin(editorId, yDoc, applyTransaction) {
  return new Plugin({
    key: annotationHandlePluginKey,
    state: {
      init() {
        return null;
      },
      apply(tr) {
        return tr.getMeta(annotationHandlePluginKey);
      },
    },
    props: {
      decorations(state) {
        const selection = state.selection;
        if (selection.empty) {
          // when cursor at annotation, show annotation
          const annotations = annotationPluginKey
            .getState(state)
            .annotationsAt(selection.from);
          if (!annotations.length) {
            return null;
          }
          return DecorationSet.create(state.doc, [
            Decoration.widget(
              selection.from,
              renderAnnotationTooltip(annotations, yDoc),
            ),
          ]);
        }
        if (!selection.annotationAdded) {
          // when select a text, ask for add an annotation
          return DecorationSet.create(state.doc, [
            Decoration.widget(
              selection.from,
              renderAnnotationHandle(state, applyTransaction, yDoc, editorId),
            ),
          ]);
        }
      },
    },
  });
}

function renderAnnotationTooltip(annotations, yDoc) {
  const $tooltip = document.createElement('div');
  $tooltip.classList.add('annotation-tooltip');

  const $annotations = document.createElement('ul');
  $annotations.classList.add('annotation-tooltip-list');

  annotations.forEach(function (annotation) {
    const $annotation = renderAnnotation(annotation, yDoc);
    $annotations.appendChild($annotation);
  });

  $tooltip.appendChild($annotations);
  return $tooltip;
}

function renderAnnotation(annotation, yDoc) {
  const $annotation = document.createElement('li');
  $annotation.classList.add('annotation-tooltip-item');

  const $text = document.createElement('span');
  $text.textContent = annotation.text;

  const $button = document.createElement('button');
  $button.classList.add('annotation-delete-button');
  $button.title = 'Delete annotation';
  $button.textContent = 'x';
  $button.addEventListener('click', function () {
    // TODO: delete from yDoc
    yDoc.getArray(ANNOTATION_ARRAY);
  });

  $annotation.appendChild($button);
  $annotation.appendChild($text);

  return $annotation;
}

function renderAnnotationHandle(state, applyTransaction) {
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
      applyTransaction(
        tr.setMeta(annotationHandlePluginKey, {
          type: ACTION_TYPE.ADD_ANNOTATION,
          id: generateUUID(),
          from: selection.from,
          to: selection.to,
          text,
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
