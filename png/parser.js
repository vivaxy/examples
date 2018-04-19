/**
 * @since 20180419 10:44
 * @author vivaxy
 */

const zlib = require('pako');
const constants = require('./parser/constants.js');
const CrcCalculator = require('./parser/crc.js');
const SyncReader = require('./parser/sync-reader.js');

module.exports = function parser(buffer, options = {}) {

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

  function interlaceNone(data) {
    // bytes per pixel
    const bpp = metadata.bpp;

    // color bytes per row
    const cpr = bpp * metadata.width;

    const pixels = new Buffer(bpp * metadata.width * metadata.height);
    let scanline;
    let offset = 0;

    for (let i = 0; i < data.length; i += cpr + 1) {

      scanline = Array.prototype.slice.call(data, i + 1, i + cpr + 1);

      switch (Buffer.from(data).readUInt8(i)) {
        case 0:
          unFilterNone(scanline, pixels, bpp, offset, cpr);
          break;
        case 1:
          unFilterSub(scanline, pixels, bpp, offset, cpr);
          break;
        case 2:
          unFilterUp(scanline, pixels, bpp, offset, cpr);
          break;
        case 3:
          unFilterAverage(scanline, pixels, bpp, offset, cpr);
          break;
        case 4:
          unFilterPaeth(scanline, pixels, bpp, offset, cpr);
          break;
        default:
          throw new Error('unkown filtered scanline');
      }

      offset += cpr;

    }

    metadata.data = pixels;

  }

  function unFilterNone(scanline, pixels, bpp, offset, cpr) {
    for (let i = 0, to = cpr; i < to; i++) {
      pixels[offset + i] = scanline[i];
    }
  }

  function unFilterSub(scanline, pixels, bpp, offset, cpr) {
    let i = 0;
    for (; i < bpp; i++) pixels[offset + i] = scanline[i];
    for (; i < cpr; i++) {
      // Raw(x) + Raw(x - bpp)
      pixels[offset + i] = (scanline[i] + pixels[offset + i - bpp]) & 0xFF;
    }
  }

  function unFilterUp(scanline, pixels, bpp, offset, cpr) {
    var i = 0, byte, prev;
    // Prior(x) is 0 for all x on the first scanline
    if ((offset - cpr) < 0) for (; i < cpr; i++) {
      pixels[offset + i] = scanline[i];
    } else for (; i < cpr; i++) {
      // Raw(x)
      byte = scanline[i];
      // Prior(x)
      prev = pixels[offset + i - cpr];
      pixels[offset + i] = (byte + prev) & 0xFF;
    }
  }

  function unFilterAverage(scanline, pixels, bpp, offset, cpr) {
    let i = 0, byte, prev, prior;
    if ((offset - cpr) < 0) {
      // Prior(x) == 0 && Raw(x - bpp) == 0
      for (; i < bpp; i++) {
        pixels[offset + i] = scanline[i];
      }
      // Prior(x) == 0 && Raw(x - bpp) != 0 (right shift, prevent doubles)
      for (; i < cpr; i++) {
        pixels[offset + i] = (scanline[i] + (pixels[offset + i - bpp] >> 1)) & 0xFF;
      }
    } else {
      // Prior(x) != 0 && Raw(x - bpp) == 0
      for (; i < bpp; i++) {
        pixels[offset + i] = (scanline[i] + (pixels[offset - cpr + i] >> 1)) & 0xFF;
      }
      // Prior(x) != 0 && Raw(x - bpp) != 0
      for (; i < cpr; i++) {
        byte = scanline[i];
        prev = pixels[offset + i - bpp];
        prior = pixels[offset + i - cpr];
        pixels[offset + i] = (byte + (prev + prior >> 1)) & 0xFF;
      }
    }
  }

  function unFilterPaeth(scanline, pixels, bpp, offset, cpr) {
    let i = 0, raw, a, b, c, p, pa, pb, pc, pr;
    if ((offset - cpr) < 0){
      // Prior(x) == 0 && Raw(x - bpp) == 0
      for (; i < bpp; i++){
        pixels[offset + i] = scanline[i];
      }
      // Prior(x) == 0 && Raw(x - bpp) != 0
      // paethPredictor(x, 0, 0) is always x
      for (; i < cpr; i++){
        pixels[offset + i] = (scanline[i] + pixels[offset + i - bpp]) & 0xFF;
      }
    } else {
      // Prior(x) != 0 && Raw(x - bpp) == 0
      // paethPredictor(x, 0, 0) is always x
      for (; i < bpp; i++){
        pixels[offset + i] = (scanline[i] + pixels[offset + i - cpr]) & 0xFF;
      }
      // Prior(x) != 0 && Raw(x - bpp) != 0
      for (; i < cpr; i++){
        raw = scanline[i];
        a = pixels[offset + i - bpp];
        b = pixels[offset + i - cpr];
        c = pixels[offset + i - cpr - bpp];
        p = a + b - c;
        pa = Math.abs(p - a);
        pb = Math.abs(p - b);
        pc = Math.abs(p - c);
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b;
        else pr = c;
        pixels[offset + i] = (raw + pr) & 0xFF;
      }
    }
  }

  function interlaceAdam7(data) {
    throw new Error('Adam7 interlacing is not implemented yet.');
  }

  function start() {
    handleSignature(constants.PNG_SIGNATURE.length);
    syncReader.process();

    let inflateData = Buffer.concat(inflateDataList);
    inflateDataList.length = 0;
    let inflatedData;
    inflatedData = inflateSync(inflateData);
    inflateData = null;

    if (!inflatedData || !inflatedData.length) {
      throw new Error('bad png - invalid inflate data response');
    }

    if (metadata.interlace) {
      interlaceAdam7(inflatedData);
    } else {
      interlaceNone(inflatedData);
    }

    metadata.gamma = metadata.gamma || 0;

    return metadata;
  }

  return start();
};
