/**
 * @since 20180419 10:44
 * @author vivaxy
 */

const zlib = require('pako');
const constants = require('../lib/constants.js');
const CrcCalculator = require('../lib/crc.js');
const SyncReader = require('./sync-reader.js');
const filter = require('./filter.js');
const dataToBitMap = require('./dataToBitMap/index.js');
const formatNormaliser = require('./format-normaliser.js');

module.exports = function decode(buffer, options = {}) {
  const syncReader = new SyncReader(buffer);

  const checkCRC = options.checkCRC === undefined ? true : options.checkCRC;

  let hasIHDR = false;
  let hasIEND = false;

  const metadata = {
    colorType: 0,
    palette: [],
  };
  const inflateDataList = [];

  let crc;
  const chunks = {
    [constants.TYPE_IHDR]: handleIHDR,
    [constants.TYPE_IEND]: handleIEND,
    [constants.TYPE_IDAT]: handleIDAT,
    [constants.TYPE_PLTE]: handlePLTE,
    [constants.TYPE_tRNS]: handleTRNS,
    [constants.TYPE_gAMA]: handleGAMA,
  };

  function read(length, callback) {
    syncReader.read(length, callback);
  }

  function inflateSync(data) {
    return zlib.inflate(data);
  }

  function parseChunkBegin(data) {
    // chunk content length
    const length = data.readUInt32BE(0);

    // chunk type
    const type = data.readUInt32BE(4);
    let name = '';
    for (let i = 4; i < 8; i++) {
      name += String.fromCharCode(data[i]);
    }
    // chunk flags
    const ancillary = Boolean(data[4] & 0x20); // or critical
    //    priv = Boolean(data[5] & 0x20), // or public
    //    safeToCopy = Boolean(data[7] & 0x20); // or unsafe

    if (!hasIHDR && type !== constants.TYPE_IHDR) {
      throw new Error('Expected IHDR on beggining');
    }

    crc = new CrcCalculator();
    crc.write(Buffer.from(name));

    if (chunks[type]) {
      return chunks[type](length);
    }

    if (!ancillary) {
      throw new Error('Unsupported critical chunk type ' + name);
    }

    read(length + 4, skipChunk);
  }

  function skipChunk() {
    read(8, parseChunkBegin);
  }

  function handleChunkEnd() {
    read(4, parseChunkEnd);
  }

  function parseChunkEnd(data) {
    const fileCrc = data.readInt32BE(0);
    const calcCrc = crc.crc32();

    // check CRC
    if (checkCRC && calcCrc !== fileCrc) {
      throw new Error('Crc error - ' + fileCrc + ' - ' + calcCrc);
    }

    if (!hasIEND) {
      read(8, parseChunkBegin);
    }
  }

  function handleSignature(length) {
    read(length, parseSignature);
  }

  function parseSignature(data) {
    const signature = constants.PNG_SIGNATURE;
    for (let i = 0; i < signature.length; i++) {
      if (data[i] !== signature[i]) {
        throw new Error(`Invalid file signature, at position ${i}: ${data[i]} !== ${signature[i]}`);
      }
    }
    read(8, parseChunkBegin);
  }

  function handleIHDR(length) {
    read(length, parseIHDR);
  }

  function parseIHDR(data) {

    crc.write(data);

    const width = data.readUInt32BE(0);
    const height = data.readUInt32BE(4);
    const depth = data[8];
    const colorType = data[9]; // bits: 1 palette, 2 color, 4 alpha
    const compr = data[10];
    const filter = data[11];
    const interlace = data[12];

    if (depth !== 8 && depth !== 4 && depth !== 2 && depth !== 1 && depth !== 16) {
      throw new Error('Unsupported bit depth ' + depth);
    }
    if (!(colorType in constants.COLORTYPE_TO_BPP_MAP)) {
      throw new Error('Unsupported color type');
    }
    if (compr !== 0) {
      throw new Error('Unsupported compression method');
    }
    if (filter !== 0) {
      throw new Error('Unsupported filter method');
    }
    if (interlace !== 0 && interlace !== 1) {
      throw new Error('Unsupported interlace method');
    }

    const bpp = constants.COLORTYPE_TO_BPP_MAP[colorType];

    hasIHDR = true;

    metadata.width = width;
    metadata.height = height;
    metadata.depth = depth;
    metadata.interlace = Boolean(interlace);
    metadata.palette = Boolean(colorType & constants.COLORTYPE_PALETTE);
    metadata.color = Boolean(colorType & constants.COLORTYPE_COLOR);
    metadata.alpha = Boolean(colorType & constants.COLORTYPE_ALPHA);
    metadata.bpp = bpp;
    metadata.colorType = colorType;

    handleChunkEnd();
  }

  function handleIDAT(length) {
    read(-length, parseIDAT.bind(null, length));
  }

  function parseIDAT(length, data) {
    crc.write(data);

    if (metadata.colorType === constants.COLORTYPE_PALETTE_COLOR && metadata.palette.length === 0) {
      throw new Error('Expected palette not found');
    }

    inflateDataList.push(data);
    const leftOverLength = length - data.length;

    if (leftOverLength > 0) {
      handleIDAT(leftOverLength);
    } else {
      handleChunkEnd();
    }
  }

  function handlePLTE(length) {
    read(length, parsePLTE);
  }

  function parsePLTE(data) {
    crc.write(data);

    const entries = Math.floor(data.length / 3);

    for (let i = 0; i < entries; i++) {
      metadata.palette.push([
        data[i * 3],
        data[i * 3 + 1],
        data[i * 3 + 2],
        0xff,
      ]);
    }

    handleChunkEnd();
  }

  function handleTRNS(length) {
    read(length, parseTRNS);
  }

  function parseTRNS(data) {
    crc.write(data);

    // palette
    if (metadata.colorType === constants.COLORTYPE_PALETTE_COLOR) {
      if (metadata.palette.length === 0) {
        throw new Error('Transparency chunk must be after palette');
      }
      if (data.length > metadata.palette.length) {
        throw new Error('More transparent colors than palette size');
      }
      for (let i = 0; i < data.length; i++) {
        metadata.palette[i][3] = data[i];
      }
    }

    // for colorType 0 (grayscale) and 2 (rgb)
    // there might be one gray/color defined as transparent
    if (metadata.colorType === constants.COLORTYPE_GRAYSCALE) {
      // grey, 2 bytes
      metadata.transColor = [data.readUInt16BE(0)];
    }
    if (metadata.colorType === constants.COLORTYPE_COLOR) {
      metadata.transColor = [data.readUInt16BE(0), data.readUInt16BE(2), data.readUInt16BE(4)];
    }

    handleChunkEnd();
  }

  function handleGAMA(length) {
    read(length, parseGAMA);
  }

  function parseGAMA(data) {

    crc.write(data);
    metadata.gamma = data.readUInt32BE(0) / constants.GAMMA_DIVISION;

    handleChunkEnd();
  }

  function handleIEND(length) {
    read(length, parseIEND);
  }

  function parseIEND(data) {
    crc.write(data);

    hasIEND = true;
    handleChunkEnd();
  }

  function start() {
    handleSignature(constants.PNG_SIGNATURE.length);
    syncReader.process();

    let inflateData = Buffer.concat(inflateDataList);
    inflateDataList.length = 0;

    let inflatedData = inflateSync(inflateData);
    inflateData = null;

    if (!inflatedData || !inflatedData.length) {
      throw new Error('bad png - invalid inflate data response');
    }

    let unfilteredData = filter(inflatedData, metadata);
    inflatedData = null;

    let bitmapData = dataToBitMap(unfilteredData, metadata);
    unfilteredData = null;

    metadata.data = formatNormaliser(bitmapData, metadata, options.skipRescale);
    bitmapData = null;

    metadata.gamma = metadata.gamma || 0;
  }

  start();
  return metadata;
};
