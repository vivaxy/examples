/**
 * @since 20180419 10:47
 * @author vivaxy
 */

const test = require('ava');
const { PNG } = require('pngjs3');
const getBuffer = require('./helpers/get-buffer.js');

const parser = require('../parser.js');

test('parser', async(t) => {
  [
    getBuffer('googlelogo_color_272x92dp.png'),
    getBuffer('googlelogo_color_272x92dp_interlaced_smallest.png'),
    getBuffer('pixles_5x5_interlace.png'),
    getBuffer('pixles_color.png'),
    getBuffer('pixles_comp_interlace.png'),
    getBuffer('pixles_none_comp_none_interlace.png'),
  ].forEach(async(buffer) => {
    const result = parser(buffer);
    const expect = PNG.sync.read(buffer);
    t.is(result.data.length, result.width * result.height * 4);
    t.is(result.data.length, expect.data.length);
    for (let i = 0; i < result.data.length; i++) {
      t.is(result.data[i], expect.data[i], 'Index: ' + i);
    }
    delete expect.data;
    delete result.data;
    t.deepEqual(expect, result);
  });
});
