/**
 * @since 2021-06-30
 * @author vivaxy
 */
import { PluginKey } from 'prosemirror-state';

export const annotationPluginKey = new PluginKey('annotation');
export const annotationHandlePluginKey = new PluginKey('annotation-handle');
export const ANNOTATION_ARRAY = 'ANNOTATION_ARRAY';
export const ACTION_TYPE = {
  ADD_ANNOTATION: 'addAnnotation',
  DELETE_ANNOTATION: 'deleteAnnotation',
};
