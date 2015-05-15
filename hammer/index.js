/**
 * @since 150515 14:49
 * @author vivaxy
 */
var canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d'),
    width = window.innerWidth,
    height = window.innerHeight;
canvas.width = width;
canvas.height = height;

var log = function (text) {
    ctx.clearRect(0, 0, width, height);
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    var r = Math.floor(Math.random() * 255),
        g = Math.floor(Math.random() * 255),
        b = Math.floor(Math.random() * 255);
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.textBaseline = 'top';
    ctx.fillText(text, width / 2, height / 2);
};

var hammer = new Hammer(canvas);
hammer.on('pinch', function (e) {
    /**
     INPUT_START 1
     INPUT_MOVE 2
     INPUT_END 4
     INPUT_CANCEL 8
     */
    if (e.eventType === 2 && e.scale > 1 && e.rotation > -30 && e.rotation < 30 && e.pointers.length === 2) {
        var point1 = e.pointers[0],
            point2 = e.pointers[1];
        if (Math.abs(point1.pageX - point2.pageX) > Math.abs(point1.pageY - point2.pageY) * 2) {
            console.log('zoom in');
            log('zoom in');
        }
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
