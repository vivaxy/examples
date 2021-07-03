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
  ORIGINS,
  absPosToRelPos,
} from './common';

export function createAnnotationHandlePlugin(editorId, yDoc, applyTransaction) {
  return new Plugin({
    key: annotationHandlePluginKey,
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
              renderAnnotationTooltip(annotations, applyTransaction, state),
            ),
          ]);
        }
        if (!selection.annotationAdded) {
          // when select a text, ask for add an annotation
          return DecorationSet.create(state.doc, [
            Decoration.widget(
              selection.from,
              renderAnnotationHandle(state, applyTransaction),
            ),
          ]);
        }
      },
    },
  });
}

function renderAnnotationTooltip(annotations, applyTransaction, state) {
  const $tooltip = document.createElement('div');
  $tooltip.classList.add('annotation-tooltip');

  const $annotations = document.createElement('ul');
  $annotations.classList.add('annotation-tooltip-list');

  annotations.forEach(function (annotation) {
    const $annotation = renderAnnotation(annotation, applyTransaction, state);
    $annotations.appendChild($annotation);
  });

  $tooltip.appendChild($annotations);
  return $tooltip;
}

function renderAnnotation(annotation, applyTransaction, state) {
  const $annotation = document.createElement('li');
  $annotation.classList.add('annotation-tooltip-item');

  const $text = document.createElement('span');
  $text.textContent = annotation.text;

  const $button = document.createElement('button');
  $button.classList.add('annotation-delete-button');
  $button.title = 'Delete annotation';
  $button.textContent = 'x';
  $button.addEventListener('click', function () {
    applyTransaction(
      state.tr.setMeta(annotationHandlePluginKey, {
        type: ACTION_TYPE.DELETE_ANNOTATION,
        id: annotation.id,
        from: annotation.from,
        to: annotation.to,
        text: annotation.text,
        origin: ORIGINS.LOCAL,
      }),
    );
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
          from: absPosToRelPos(selection.from, state),
          to: absPosToRelPos(selection.to, state),
          text,
          origin: ORIGINS.LOCAL,
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
