/**
 * @since 2021-07-08
 * @author vivaxy
 */
import * as decoding from 'lib0/decoding';
import * as binary from 'lib0/binary';
import contentRefs from './content-decoder';
import readDeleteSet from './delete-set-decoder';

export default function decode(clientID, decoder) {
  if (!(decoder instanceof decoding.Decoder)) {
    decoder = decoding.createDecoder(decoder);
  }
  const structRefs = readClientsStructRefs(decoder);

  const clientData = structRefs[clientID];

  const deleteSet = readDeleteSet(decoder);

  if (!clientData) {
    if (Object.keys(deleteSet.clients).length) {
      return { clientID, deleteSet };
    }
    return { clientID };
  }
  const clock = clientData.items[0].clock;
  const totalLength = clientData.totalLength;

  if (Object.keys(deleteSet.clients).length) {
    return {
      clock,
      clientID,
      totalLength,
      items: clientData.items,
      deleteSet,
    };
  }
  return {
    clock,
    clientID,
    totalLength,
    items: clientData.items,
  };
}

function readClientsStructRefs(decoder) {
  const clientRefs = {};
  const numOfStateUpdates = decoding.readVarUint(decoder);
  let totalLength = 0;
  for (let i = 0; i < numOfStateUpdates; i++) {
    const numberOfStructs = decoding.readVarUint(decoder);
    const items = [];
    let { clock, client } = readID(decoder);

    for (let i = 0; i < numberOfStructs; i++) {
      const info = decoding.readUint8(decoder);
      let struct;
      if ((binary.BITS5 & info) !== 0) {
        struct = readItem(client, clock, decoder, info);
      } else {
        struct = new Item(client, clock, {
          length: decoding.readVarUint(decoder),
        });
      }
      items.push(struct);
      clock += struct.length;
      totalLength += struct.length;
    }
    clientRefs[client] = {
      items,
      totalLength,
    };
  }
  return clientRefs;
}

function readID(decoder) {
  return {
    client: decoding.readVarUint(decoder),
    clock: decoding.readVarUint(decoder),
  };
}

class Item {
  constructor(
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

  return new Item(
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
