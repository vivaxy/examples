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
  ORIGINS,
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

function decorationToJSON(decoration) {
  const { from, to, type } = decoration;
  const { id, text } = type.spec;
  return { from, to, id, text };
}

class AnnotationState {
  constructor(decorationSet, editorId, onAnnotationChange) {
    // the one true source of annotations
    this.decorationSet = decorationSet;
    this.editorId = editorId;
    this.onAnnotationChange = onAnnotationChange;
  }

  static init(config, editorId, onAnnotationChange) {
    const decorations = config.annotations.map(function (annotation) {
      return createDecoration(
        annotation.from,
        annotation.to,
        annotation.id,
        annotation.text,
      );
    });
    return new AnnotationState(
      DecorationSet.create(config.doc, decorations),
      editorId,
      onAnnotationChange,
    );
  }

  annotationsAt(pos) {
    // when at boundary, decorationSet.find(pos, pos) matches, decorationSet.find(pos + 1, pos - 1) not matches
    return this.decorationSet.find(pos + 1, pos - 1).map(decorationToJSON);
  }

  findDecoration(id) {
    return this.decorationSet.find().find(function (decoration) {
      return decoration.type.spec.id === id;
    });
  }

  apply(transaction, prevAnnotationState, oldEditorState, newEditorState) {
    // only care for
    // - local doc change (remote doc change will always apply as local doc change)
    // - local annotation change
    // - remote annotation change

    // annotation change, local and remote
    const meta = transaction.getMeta(annotationHandlePluginKey);
    if (meta) {
      const { type, id, origin, from, to, text } = meta;
      let decorationSet = this.decorationSet;
      if (type === ACTION_TYPE.ADD_ANNOTATION) {
        decorationSet = this.decorationSet.add(transaction.doc, [
          createDecoration(from, to, id, text),
        ]);
      } else if (type === ACTION_TYPE.DELETE_ANNOTATION) {
        decorationSet = this.decorationSet.remove([this.findDecoration(id)]);
      }
      const newAnnotationState = new AnnotationState(
        decorationSet,
        this.editorId,
        this.onAnnotationChange,
      );
      if (origin === ORIGINS.LOCAL) {
        this.onAnnotationChange({
          type,
          id,
          from,
          to,
          text,
          annotations: newAnnotationState.toJSON(),
        });
      }
      return newAnnotationState;
    }

    // local doc changed
    const ySyncState = ySyncPluginKey.getState(newEditorState);
    if (ySyncState && ySyncState.isChangeOrigin) {
      const mappedDecorationSet = this.decorationSet;
      return new AnnotationState(
        mappedDecorationSet,
        this.editorId,
        this.onAnnotationChange,
      );
    }

    // TODO: how to detect remote annotation change?

    // other changes
    return this;
  }

  toJSON() {
    return this.decorationSet.find().map(decorationToJSON);
  }

  fromJSON(config) {
    return AnnotationState.init(config, this.editorId, this.onAnnotationChange);
  }
}

export function createAnnotationPlugin(editorId, onAnnotationChange) {
  return new Plugin({
    key: annotationPluginKey,
    state: {
      init(config) {
        return AnnotationState.init(config, editorId, onAnnotationChange);
      },
      apply(transaction, prevAnnotationState, oldEditorState, newEditorState) {
        return prevAnnotationState.apply(
          transaction,
          prevAnnotationState,
          oldEditorState,
          newEditorState,
        );
      },
      toJSON(state) {
        const annotationState = annotationPluginKey.getState(state);
        return annotationState.toJSON();
      },
      fromJSON(config, annotationState) {
        return annotationState.fromJSON(config);
      },
    },
    props: {
      decorations(state) {
        return this.getState(state).decorationSet;
      },
    },
  });
}
