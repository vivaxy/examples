/**
 * @since 2017-03-22 10:32:51
 * @author vivaxy
 */

var scene = document.querySelector('a-scene');
var size = 500;
var offset = 2 * size;
var half = size / 2;

var list = ['up', 'down', 'front', 'back', 'left', 'right'];
var rotationList = [
  '90 0 0',
  '-90 0 0',
  '0 0 0',
  '0 180 0',
  '0 90 0',
  '0 -90 0',
];

list.forEach(function (position, index) {
  for (var i = 1; i < 5; i++) {
    for (var j = 1; j < 5; j++) {
      var imageId = position + '-' + i + '-' + j + '.jpg';

      var plane = document.createElement('a-plane');
      plane.setAttribute('src', './images/' + imageId);
      plane.setAttribute('rotation', rotationList[index]);
      plane.setAttribute('width', String(size));
      plane.setAttribute('height', String(size));
      plane.setAttribute('shader', 'flat');
      switch (position) {
        case 'up':
          var x = size * j - offset - half;
          var y = offset - half;
          var z = -size * i + offset + half;
          plane.setAttribute('position', x + ' ' + y + ' ' + z);
          break;
        case 'down':
          var x = size * j - offset - half;
          var y = -offset - half;
          var z = size * i - offset - half;
          plane.setAttribute('position', x + ' ' + y + ' ' + z);
          break;
        case 'front':
          var x = size * j - offset - half;
          var y = -size * i + offset;
          var z = -offset;
          plane.setAttribute('position', x + ' ' + y + ' ' + z);
          break;
        case 'back':
          var x = -size * j + offset + half;
          var y = -size * i + offset;
          var z = offset;
          plane.setAttribute('position', x + ' ' + y + ' ' + z);
          break;
        case 'left':
          var x = -offset;
          var y = -size * i + offset;
          var z = -size * j + offset + half;
          plane.setAttribute('position', x + ' ' + y + ' ' + z);
          break;
        case 'right':
          var x = offset;
          var y = -size * i + offset;
          var z = size * j - offset - half;
          plane.setAttribute('position', x + ' ' + y + ' ' + z);
          break;
      }
      scene.appendChild(plane);
    }
  }
});
