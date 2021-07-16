/**
 * @since 2021-07-08
 * @author vivaxy
 */
import * as decoding from 'lib0/decoding';
import * as error from 'lib0/error';
import typeRefs from './type-decoder';

function readContentDeleted(decoder) {
  return {
    type: 'deleted',
    length: decoding.readVarUint(decoder),
  };
}

function readContentEmbed(decoder) {
  const embed = decoding.readVarString(decoder);
  debugger;
  return {
    type: 'embed',
    content: embed,
    length: 1,
  };
}

function readContentFormat(decoder) {
  const key = decoding.readVarString(decoder);
  const value = decoding.readVarString(decoder);
  return {
    type: 'format',
    content: { key, value },
    length: 1,
  };
}

function readContentJSON(decoder) {
  const length = decoding.readVarUint(decoder);
  const content = [];
  for (let i = 0; i < length; i++) {
    const c = decoding.readVarString(decoder);
    if (c === 'undefined') {
      content.push(undefined);
    } else {
      content.push(JSON.parse(c));
    }
  }
  return {
    type: 'json',
    content,
    length,
  };
}

function readContentString(decoder) {
  const string = decoding.readVarString(decoder);
  return {
    type: 'string',
    string,
    length: string.length,
  };
}

function readContentType(decoder) {
  const contentType = typeRefs[decoding.readVarUint(decoder)](decoder);
  return {
    type: 'type',
    content: contentType,
    length: 1,
  };
}

function readContentBinary(decoder) {
  const binary = decoding.readVarUint8Array(decoder);
  return {
    type: 'binary',
    content: binary,
    length: 1,
  };
}

function readContentAny(decoder) {
  const len = decoding.readVarUint(decoder);
  const content = [];

  for (let i = 0; i < len; i++) {
    const con = decoding.readAny(decoder);
    content.push(con);
  }

  return {
    type: 'any',
    content,
    length: len,
  };
}

const contentDecoder = [
  () => {
    throw error.unexpectedCase();
  }, // GC is not ItemContent
  readContentDeleted,
  readContentJSON,
  readContentBinary,
  readContentString,
  readContentEmbed,
  readContentFormat,
  readContentType,
  readContentAny,
];

export default contentDecoder;
