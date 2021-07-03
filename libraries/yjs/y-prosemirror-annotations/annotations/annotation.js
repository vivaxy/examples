/**
 * @since 2021-06-30
 * @author vivaxy
 *
 * annotation: {
 *   from: y.js relative position
 *   to: y.js relative position
 *   id: annotation id
 *   text: comment
 * }
 */
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Plugin } from 'prosemirror-state';
import {
  annotationPluginKey,
  annotationHandlePluginKey,
  ACTION_TYPE,
  ORIGINS,
  relPosToAbsPos,
} from './common';
import { ySyncPluginKey } from 'y-prosemirror';

function createDecoration(relFrom, relTo, id, text, editorState) {
  return Decoration.inline(
    relPosToAbsPos(relFrom, editorState),
    relPosToAbsPos(relTo, editorState),
    { class: 'annotation-highlight', ['data-id']: id },
    {
      id,
      text,
      from: relFrom,
      to: relTo,
    },
  );
}

function decorationToJSON(decoration) {
  const { id, text, from, to } = decoration.type.spec;
  return { from, to, id, text };
}

class AnnotationState {
  constructor(decorationSet, editorId, onAnnotationChange) {
    // the one true source of annotations
    this.decorationSet = decorationSet;
    this.editorId = editorId;
    this.onAnnotationChange = onAnnotationChange;
  }

  static init(config, editorState, editorId, onAnnotationChange) {
    const decorations = (config.annotations || []).map(function (annotation) {
      return createDecoration(
        annotation.from,
        annotation.to,
        annotation.id,
        annotation.text,
        editorState,
      );
    });
    return new AnnotationState(
      DecorationSet.create(config.doc, decorations),
      editorId,
      onAnnotationChange,
    );
  }

  annotationsAt(absPos) {
    // when at boundary, decorationSet.find(pos, pos) matches, decorationSet.find(pos + 1, pos - 1) not matches
    return this.decorationSet
      .find(absPos + 1, absPos - 1)
      .map(decorationToJSON);
  }

  findDecoration(id) {
    return this.decorationSet.find().find(function (decoration) {
      return decoration.type.spec.id === id;
    });
  }

  apply(transaction, prevAnnotationState, oldEditorState, newEditorState) {
    // annotation change
    // local annotation change: from annotationHandlePlugin
    // remote annotation change: from broadcastAnnotation
    const meta = transaction.getMeta(annotationHandlePluginKey);
    if (meta) {
      const { type, id, origin, from, to, text } = meta;
      let decorationSet = this.decorationSet;
      if (type === ACTION_TYPE.ADD_ANNOTATION) {
        decorationSet = this.decorationSet.add(transaction.doc, [
          createDecoration(from, to, id, text, newEditorState),
        ]);
      } else if (type === ACTION_TYPE.DELETE_ANNOTATION) {
        decorationSet = this.decorationSet.remove([this.findDecoration(id)]);
      }
      if (origin === ORIGINS.LOCAL) {
        this.onAnnotationChange({
          type,
          id,
          from,
          to,
          text,
        });
      }
      return new AnnotationState(
        decorationSet,
        this.editorId,
        this.onAnnotationChange,
      );
    }

    // doc change
    // local doc change: from ProseMirror
    // remote doc change: from ySyncPlugin
    if (transaction.docChanged) {
      const ySyncMeta = transaction.getMeta(ySyncPluginKey);
      if (ySyncMeta) {
        // triggered by ySyncPlugin
        const decorations = this.toJSON().map(function (annotation) {
          return createDecoration(
            annotation.from,
            annotation.to,
            annotation.id,
            annotation.text,
            newEditorState,
          );
        });
        return new AnnotationState(
          DecorationSet.create(transaction.doc, decorations),
          this.editorId,
          this.onAnnotationChange,
        );
      } else {
        // triggered by ProseMirror
        const decorationSet = this.decorationSet.map(
          transaction.mapping,
          transaction.doc,
        );
        return new AnnotationState(
          decorationSet,
          this.editorId,
          this.onAnnotationChange,
        );
      }
    }

    return this;
  }

  toJSON() {
    return this.decorationSet.find().map(decorationToJSON);
  }

  fromJSON(config, editorState) {
    return AnnotationState.init(
      config,
      editorState,
      this.editorId,
      this.onAnnotationChange,
    );
  }
}

export function createAnnotationPlugin(editorId, onAnnotationChange) {
  return new Plugin({
    key: annotationPluginKey,
    state: {
      init(config, editorState) {
        return AnnotationState.init(
          config,
          editorState,
          editorId,
          onAnnotationChange,
        );
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
