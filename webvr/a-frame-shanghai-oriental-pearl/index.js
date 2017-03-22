/**
 * @since 2017-03-22 10:32:51
 * @author vivaxy
 */

var scene = document.querySelector('a-scene');
var size = 100;
var offset = 2 * size;

var list = ['u', 'd', 'f', 'b', 'l', 'r'];
var rotationList = ['90 0 0', '-90 0 0', '0 0 0', '0 180 0', '0 90 0', '0 -90 0'];

list.forEach(function(position, index) {
    for (var i = 1; i < 5; i++) {
        for (var j = 1; j < 5; j++) {
            var imageId = position + '_' + i + '_' + j + '.jpg';

            var plane = document.createElement('a-plane');
            plane.setAttribute('src', './img/' + imageId);
            plane.setAttribute('rotation', rotationList[index]);
            plane.setAttribute('width', size);
            plane.setAttribute('height', size);
            switch (position) {
                case 'u':
                    var x = size * j - offset;
                    var y = offset;
                    var z = -size * i + offset;
                    plane.setAttribute('position', x + ' ' + y + ' ' + z);
                    break;
                case 'd':
                    var x = size * j - offset;
                    var y = -offset;
                    var z = size * i - offset;
                    plane.setAttribute('position', x + ' ' + y + ' ' + z);
                    break;
                case 'f':
                    var x = size * j - offset;
                    var y = -size * i + offset;
                    var z = -offset;
                    plane.setAttribute('position', x + ' ' + y + ' ' + z);
                    break;
                case 'b':
                    var x = -size * j + offset;
                    var y = -size * i + offset;
                    var z = offset;
                    plane.setAttribute('position', x + ' ' + y + ' ' + z);
                    break;
                case 'l':
                    var x = -offset;
                    var y = -size * i + offset;
                    var z = -size * j + offset;
                    plane.setAttribute('position', x + ' ' + y + ' ' + z);
                    break;
                case 'r':
                    var x = offset;
                    var y = -size * i + offset;
                    var z = size * j - offset;
                    plane.setAttribute('position', x + ' ' + y + ' ' + z);
                    break;
            }
            scene.appendChild(plane);
        }
    }
});
