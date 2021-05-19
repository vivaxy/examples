/**
 * @since 2021-05-19
 * @author vivaxy
 */
import { DOMParser } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';

export const MESSAGE_TYPE = 'prosemirror-collab-sample';
export const MESSAGE_TYPE_INIT = 'init';
export const MESSAGE_TYPE_SYNC_DOC = 'sync-doc';
export const MESSAGE_TYPE_EDIT_STEP = 'edit-step';
export const MESSAGE_TYPE_SYNC_STEPS = 'sync-steps';

export function createStateFromSerializedDoc(serializedDoc) {
  const div = document.createElement('div');
  div.innerHTML = serializedDoc;
  return createStateFromDOM(div);
}

export function createStateFromDOM(node) {
  return createStateFromDoc(DOMParser.fromSchema(schema).parse(node));
}

export function createStateFromDoc(doc) {
  return EditorState.create({
    schema,
    doc,
  });
}
