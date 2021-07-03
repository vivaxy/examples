/**
 * @since 2021-06-30
 * @author vivaxy
 */
import * as Y from 'yjs';
import { PluginKey } from 'prosemirror-state';
import {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
  ySyncPluginKey,
} from 'y-prosemirror';

export const annotationPluginKey = new PluginKey('annotation');
export const annotationHandlePluginKey = new PluginKey('annotation-handle');
export const ACTION_TYPE = {
  ADD_ANNOTATION: 'addAnnotation',
  DELETE_ANNOTATION: 'deleteAnnotation',
};
export const ORIGINS = {
  LOCAL: 'local',
  REMOTE: 'remote',
};

export function absPosToRelPos(pos, editorState) {
  const ySyncState = ySyncPluginKey.getState(editorState);
  return absolutePositionToRelativePosition(
    pos,
    ySyncState.type,
    ySyncState.binding.mapping,
  );
}

export function relPosToAbsPos(pos, editorState) {
  const ySyncState = ySyncPluginKey.getState(editorState);
  return relativePositionToAbsolutePosition(
    ySyncState.doc,
    ySyncState.type,
    Y.createRelativePositionFromJSON(pos),
    ySyncState.binding.mapping,
  );
}
