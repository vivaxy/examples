/**
 * @since 2019-02-26 16:27
 * @author vivaxy
 * @supported android 5
 * @see https://github.com/sindresorhus/file-type
 * @see https://github.com/qzb/is-animated
 */

var consoleEl = document.querySelector('.js-console');
var input = document.querySelector('input');

input.addEventListener('change', handleChange);

function handleChange(e) {
  for (var i = 0; i < e.target.files.length; i++) {
    var fileReader = new FileReader();
    var file = e.target.files[i];
    fileReader.addEventListener('load', handleFileReaderLoad(file));
    fileReader.readAsArrayBuffer(file);
  }
}

function handleFileReaderLoad(file) {
  return function(e) {
    var imageMeta = getImageMeta(e.target.result);
    if (imageMeta) {
      return log(imageMeta.ext, imageMeta.mime, file.name, imageMeta.animated ? '✔' : '✖');
    }
    return log('N/A', 'N/A', file.name, 'N/A');
  };
}

function log(extension, mime, filename, animated) {
  consoleEl.innerHTML += '<tr><td>' + extension + '</td><td>' + mime + '</td><td>' + filename + '</td><td>' + animated + '</td></tr>';
}

function getImageMeta(arrayBuffer) {
  var buffer = new Uint8Array(arrayBuffer);
  if (check(buffer, [0xFF, 0xD8, 0xFF])) {
    return {
      ext: 'jpg',
      mime: 'image/jpeg',
      animated: false,
    };
  }
  if (check(buffer, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
    // apng has `61 63 54 4C` before first `00 00 00 08`
    if (findIndex(buffer, [0x61, 0x63, 0x54, 0x4C]) === -1) {
      return {
        ext: 'png',
        mime: 'image/png',
        animated: false,
      };
    }
    return {
      ext: 'png',
      mime: 'image/png',
      animated: true,
    };
  }
  if (check(buffer, [0x47, 0x49, 0x46])) {
    return {
      ext: 'gif',
      mime: 'image/gif',
      animated: true,
    };
  }
  if (check(buffer, [0x57, 0x45, 0x42, 0x50], 8)) {
    if (findIndex(buffer, [0x41, 0x4E, 0x49, 0x4D]) === -1) {
      return {
        ext: 'webp',
        mime: 'image/webp',
        animated: false,
      };
    }
    return {
      ext: 'webp',
      mime: 'image/webp',
      animated: true,
    };
  }
  return null;
}

function check(buffer, codes, offset) {
  offset = offset || 0;
  for (var i = 0; i < codes.length; i++) {
    if (buffer[i + offset] !== codes[i]) {
      return false;
    }
  }
  return true;
}

function findIndex(buffer, codes, from, to) {
  from = from || 0;
  to = to || buffer.length;

  outer: for (var i = from; i < to; i++) {
    for (var j = 0; j < codes.length; j++) {
      if (buffer[i + j] !== codes[j]) {
        continue outer;
      }
    }
    return i;
  }
  return -1;
}
