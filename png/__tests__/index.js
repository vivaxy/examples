/**
 * @since 20180419 10:47
 * @author vivaxy
 */

const test = require('ava');
const { PNG } = require('pngjs');
const getBuffer = require('./helpers/get-buffer.js');

const decode = require('../decode/index.js');
const encode = require('../encode/index.js');

test('decode', async(t) => {
  [
    getBuffer('googlelogo_color_272x92dp.png'),
    getBuffer('googlelogo_color_272x92dp_interlaced_smallest.png'),
    getBuffer('pixels_5x5_interlace.png'),
    getBuffer('pixels_color.png'),
    getBuffer('pixels_comp_interlace.png'),
    getBuffer('pixels_none_comp_none_interlace.png'),
  ].forEach(async(buffer) => {
    const result = decode(buffer);
    const expect = PNG.sync.read(buffer);
    t.is(result.data.length, result.width * result.height * 4);
    t.is(result.data.length, expect.data.length);
    t.true(expect.data.equals(result.data));
    delete expect.data;
    delete result.data;
    t.deepEqual(expect, result);
  });
});

test('encode', async(t) => {
  [
    getBuffer('googlelogo_color_272x92dp.png'),
    getBuffer('googlelogo_color_272x92dp_interlaced_smallest.png'),
    getBuffer('pixels_5x5_interlace.png'),
    getBuffer('pixels_color.png'),
    getBuffer('pixels_comp_interlace.png'),
    getBuffer('pixels_none_comp_none_interlace.png'),
  ].forEach(async(buffer) => {
    const { data, width, height } = decode(buffer);
    const result = encode({ data, width, height });
    const expect = PNG.sync.write({ data, width, height });
    t.true(expect.equals(result));
  });
});
