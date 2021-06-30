/**
 * @since 2021-06-30
 * @author vivaxy
 */
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Plugin } from 'prosemirror-state';
import { ySyncPluginKey } from 'y-prosemirror';
import {
  annotationPluginKey,
  ANNOTATION_ARRAY,
  annotationHandlePluginKey,
} from './common';

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
  constructor(decorationSet, editorId) {
    this.decorationSet = decorationSet;
    this.editorId = editorId;
  }

  static init(editorId, state, yDoc) {
    const yAnnotations = yDoc.getArray(ANNOTATION_ARRAY);
    const decorations = yAnnotations.toArray().map(function (annotation) {
      return createDecoration(
        annotation.from,
        annotation.to,
        new Annotation(annotation.id, annotation.text),
      );
    });
    return new AnnotationState(
      DecorationSet.create(state.doc, decorations),
      editorId,
    );
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

  apply(
    transaction,
    prevAnnotationState,
    oldEditorState,
    newEditorState,
    yDoc,
  ) {
    if (this.editorId === '#editor-1') {
      console.log('apply');
    }
    // only care for
    // - local doc change (remote doc change will always apply as local doc change)
    // - local annotation change
    // - remote annotation change

    // local doc changed
    const ySyncState = ySyncPluginKey.getState(newEditorState);
    if (ySyncState && ySyncState.isChangeOrigin) {
      return AnnotationState.init(this.editorId, newEditorState, yDoc);
    }

    // local annotation change
    const annotationHandleState = annotationHandlePluginKey.getState(
      newEditorState,
    );
    if (annotationHandleState) {
      return AnnotationState.init(this.editorId, newEditorState, yDoc);
    }

    // TODO: how to detect remote annotation change?

    // other changes
    return this;
  }

  toJSON() {
    return this.decorationSet.find().map(function ({ from, to, type }) {
      const { id, text } = type.spec.annotation;
      return { from, to, id, text };
    });
  }

  fromJSON(config) {
    return AnnotationState.init(this.editorId, config);
  }
}

export function createAnnotationPlugin(editorId, yDoc) {
  return new Plugin({
    key: annotationPluginKey,
    state: {
      init(_, state) {
        const yAnnotations = yDoc.getArray(ANNOTATION_ARRAY);
        yAnnotations.observeDeep(function (yArrayEvent) {
          debugger;
          console.log(yArrayEvent.changes.delta);
        });
        return AnnotationState.init(editorId, state, yDoc);
      },
      apply(transaction, prevAnnotationState, oldEditorState, newEditorState) {
        return prevAnnotationState.apply(
          transaction,
          prevAnnotationState,
          oldEditorState,
          newEditorState,
          yDoc,
        );
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
}
