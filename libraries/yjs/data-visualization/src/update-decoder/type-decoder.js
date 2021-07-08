/**
 * @since 2021-07-08
 * @author vivaxy
 */
import * as Y from 'yjs';
import * as decoding from 'lib0/decoding';

const readYArray = () => {
  return new Y.Array();
};

const readYMap = () => {
  return new Y.Map();
};

const readYText = () => {
  return new Y.Text();
};

const readYXmlElement = (decoder) => {
  decoding.readVarString(decoder);
};

const readYXmlFragment = (decoder) => {};

const readYXmlHook = (decoder) => {
  decoding.readVarString(decoder);
};

const readYXmlText = (decoder) => {};

export default [
  readYArray,
  readYMap,
  readYText,
  readYXmlElement,
  readYXmlFragment,
  readYXmlHook,
  readYXmlText,
];
