/**
 * @since 150515 14:49
 * @author vivaxy
 */
var canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d'),
    width = window.innerWidth,
    height = window.innerHeight,
    fontSize = 36;
canvas.width = width;
canvas.height = height;
ctx.translate(width / 2, height / 2);

var log = function (text, scale, rotate) {
        ctx.fillStyle = '#ddd';
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.font = fontSize * scale + 'px Arial';
        ctx.rotate(rotate * Math.PI / 180);
        ctx.textAlign = 'center';
        //var r = Math.floor(Math.random() * 255),
        //    g = Math.floor(Math.random() * 255),
        //    b = Math.floor(Math.random() * 255);
        //ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        ctx.fillStyle = 'rgb(255, 0, 0)';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
    },
    isHorizon = function (pointers) {
        var point1 = pointers[0],
            point2 = pointers[1];
        return Math.abs(point1.pageX - point2.pageX) > Math.abs(point1.pageY - point2.pageY) * 2;
    },
    isInRange = function (target, point, range) {
        return Math.pow(point.x - target.x, 2) + Math.pow(point.y - target.y, 2) < Math.pow(range, 2);
    };

var hammer = new Hammer(canvas);
hammer.on('pinch', function (e) {
    /**
     INPUT_START 1
     INPUT_MOVE 2
     INPUT_END 4
     INPUT_CANCEL 8
     */
    if (e.eventType === 2 && isInRange({
            x: width / 2,
            y: height / 2
        }, e.center, 100)) {
        var msg = 'zoom';
        console.log(msg, e.scale, e.rotation);
        log(msg, e.scale, e.rotation);
        ctx.rotate(-e.rotation * Math.PI / 180);
    }
    if (e.eventType === 4 || e.eventType === 8) {
        fontSize = fontSize * e.scale;
    }
    //console.log(e);
    //console.log(e.pointers);
    //console.log(e.angle);
    //console.log(e.center);
    //console.log(e.deltaX);
    //console.log(e.deltaY);
    //console.log(e.direction);
    //console.log(e.offsetDirection);
    //console.log(e.distance);
    //console.log(e.rotation);
    //console.log(e.velocity);
});

hammer.get('pinch').set({enable: true});

log('zoom', 1, 0);
