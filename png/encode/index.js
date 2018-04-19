/**
 * @since 20180419 19:39
 * @author vivaxy
 */

const zlib = require('pako');
const constants = require('../lib/constants.js');
const Packer = require('./packer.js');

module.exports = function encode(metadata, options = {}) {

  function deflateSync(data, opt) {
    return zlib.deflate(data, opt);
  }

  const packer = new Packer(options);
  let chunks = [];

  // Signature
  chunks.push(new Buffer(constants.PNG_SIGNATURE));

  // Header
  chunks.push(packer.packIHDR(metadata.width, metadata.height));

  if (metadata.gamma) {
    chunks.push(packer.packGAMA(metadata.gamma));
  }

  let filteredData = packer.filterData(metadata.data, metadata.width, metadata.height);

  // compress it
  let compressedData = deflateSync(filteredData, packer.getDeflateOptions());
  filteredData = null;

  if (!compressedData || !compressedData.length) {
    throw new Error('bad png - invalid compressed data response');
  }
  chunks.push(packer.packIDAT(Buffer.from(compressedData)));
  compressedData = null;

  // End
  chunks.push(packer.packIEND());

  return Buffer.concat(chunks);
};
