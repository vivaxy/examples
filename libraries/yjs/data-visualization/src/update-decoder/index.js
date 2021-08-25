/**
 * @since 2021-07-08
 * @author vivaxy
 */
import * as decoding from 'lib0/decoding';
import * as binary from 'lib0/binary';
import contentRefs from './content-decoder';
import readDeleteSet from './delete-set-decoder';
import { DATA_TYPES } from '../data-viewer';

export default function updateDecoder(update) {
  const decoder = decoding.createDecoder(update);
  const firstVarUint = decoding.peekVarUint(decoder);
  if (firstVarUint === 0) {
    return 'encoding V2 not supported';
  } else {
    return decodeV1(decoder);
  }
}

export function decodeV1(decoder) {
  const clientsStructs = readClientsStructRefs(decoder);
  const deleteSet = readDeleteSet(decoder);
  return { clientsStructs, deleteSet };
}

function readClientsStructRefs(decoder) {
  const clientRefs = {};
  const numOfStateUpdates = decoding.readVarUint(decoder);
  for (let i = 0; i < numOfStateUpdates; i++) {
    const numberOfStructs = decoding.readVarUint(decoder);
    const items = [];
    let { clock, client } = readID(decoder);

    for (let i = 0; i < numberOfStructs; i++) {
      const info = decoding.readUint8(decoder);
      let struct;
      const infoType = binary.BITS5 & info;
      if (infoType === 0) {
        // GC
        struct = new AbstractStruct(DATA_TYPES.GC, client, clock, {
          length: decoding.readVarUint(decoder),
        });
      } else if (infoType === 10) {
        // Skip
        struct = new AbstractStruct(DATA_TYPES.SKIP, client, clock, {
          length: decoding.readVarUint(decoder),
        });
      } else {
        struct = readItem(client, clock, decoder, info);
      }
      items.push(struct);
      clock += struct.length;
    }
    clientRefs[client] = items;
  }
  return clientRefs;
}

function readID(decoder) {
  return {
    client: decoding.readVarUint(decoder),
    clock: decoding.readVarUint(decoder),
  };
}

class AbstractStruct {
  constructor(
    type,
    client,
    clock,
    content,
    left,
    origin,
    right,
    rightOrigin,
    parentYKey,
    parent,
  ) {
    this.type = type;
    this.client = client;
    this.clock = clock;
    this.left = left;
    this.origin = origin;
    this.right = right;
    this.rightOrigin = rightOrigin;
    this.parentYKey = parentYKey;
    this.parent = parent;
    Object.keys(content).forEach((key) => {
      this[key] = content[key];
    });
  }
}

function readItem(client, clock, decoder, info) {
  const origin = (info & binary.BIT8) === binary.BIT8 ? readID(decoder) : null;
  const rightOrigin =
    (info & binary.BIT7) === binary.BIT7 ? readID(decoder) : null;
  const canCopyParentInfo = (info & (binary.BIT7 | binary.BIT8)) === 0;

  const hasParentYKey = canCopyParentInfo
    ? decoding.readVarUint(decoder) === 1
    : false;

  const parentYKey =
    // parentYKey
    canCopyParentInfo && hasParentYKey ? decoding.readVarString(decoder) : null;

  let parent = null;
  if (canCopyParentInfo && !hasParentYKey) {
    // parent
    parent = readID(decoder);
  }

  if (canCopyParentInfo && (info & binary.BIT6) === binary.BIT6) {
    decoding.readVarString(decoder);
  }

  const itemContent = readItemContent(decoder, info);

  return new AbstractStruct(
    DATA_TYPES.ITEM,
    client,
    clock,
    itemContent,
    null,
    origin,
    null,
    rightOrigin,
    parentYKey,
    parent,
  );
}

function readItemContent(decoder, info) {
  return contentRefs[info & binary.BITS5](decoder);
}
