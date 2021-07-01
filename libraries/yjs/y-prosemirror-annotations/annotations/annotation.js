/**
 * @since 2021-06-30
 * @author vivaxy
 */
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Plugin } from 'prosemirror-state';
import { ySyncPluginKey } from 'y-prosemirror';
import {
  annotationPluginKey,
  annotationHandlePluginKey,
  ACTION_TYPE,
} from './common';

function createDecoration(from, to, id, text) {
  return Decoration.inline(
    from,
    to,
    { class: 'annotation-highlight', ['data-id']: id },
    {
      id,
      text,
    },
  );
}

class AnnotationState {
  constructor(decorationSet, editorId) {
    // the one true source of annotations
    this.decorationSet = decorationSet;
    this.editorId = editorId;
  }

  static init(editorId, state, config) {
    const decorations = config.annotations.map(function (annotation) {
      return createDecoration(
        annotation.from,
        annotation.to,
        annotation.id,
        annotation.text,
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

  apply(transaction, prevAnnotationState, oldEditorState, newEditorState) {
    // only care for
    // - local doc change (remote doc change will always apply as local doc change)
    // - local annotation change
    // - remote annotation change

    // local annotation change
    const meta = transaction.getMeta(annotationHandlePluginKey);
    if (meta) {
      const { type, id, from, to, text } = meta;
      let decorationSet = this.decorationSet;
      if (type === ACTION_TYPE.ADD_ANNOTATION) {
        decorationSet = this.decorationSet.add(transaction.doc, [
          createDecoration(from, to, id, text),
        ]);
      } else if (type === ACTION_TYPE.DELETE_ANNOTATION) {
        decorationSet = this.decorationSet.remove([this.findAnnotation(id)]);
      }
      return new AnnotationState(decorationSet, this.editorId);
    }

    // local doc changed
    const ySyncState = ySyncPluginKey.getState(newEditorState);
    if (ySyncState && ySyncState.isChangeOrigin) {
      const mappedDecorationSet = this.decorationSet;
      return new AnnotationState(mappedDecorationSet, this.editorId);
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
      init(config, state) {
        return AnnotationState.init(editorId, state, config);
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
