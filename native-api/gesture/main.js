/**
 * Author : vivaxy
 * Date   : 2014/7/17 14:23
 */

// set canvas
var canvas = document.getElementsByTagName('canvas')[0],
    ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// true if this is a mobile device
var isMobile = function () {
    var check = false;
    (function (a) {
        if (/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))check = true
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}();

// save touches
var savedTouches = [],
    randomColor = function () {
        var r = Math.floor(Math.random() * 256),
            g = Math.floor(Math.random() * 256),
            b = Math.floor(Math.random() * 256);
        r = r.toString(16); // make it a hex digit
        g = g.toString(16); // make it a hex digit
        b = b.toString(16); // make it a hex digit
        return '#' + r + g + b;
    },
    getTouch = function (touch) {
        return {
            id: isMobile ? touch.identifier : 0,
            color: randomColor(),
            x: touch.pageX,
            y: touch.pageY
        };
    },
    getTouchIndex = function (id) {
        var resultIndex = -1;
        savedTouches.forEach(function (savedTouche, index) {
            if (savedTouche.id === id) {
                resultIndex = index;
            }
        });
        return resultIndex;
    };

// set events
var startEvent = isMobile ? 'touchstart' : 'mousedown',
    moveEvent = isMobile ? 'touchmove' : 'mousemove',
    endEvent = isMobile ? 'touchend' : 'mouseup',
// click or touch starts
    startHandler = function (e) {
        e.preventDefault();
        var touches = isMobile ? e.changedTouches : [e];
        Array.prototype.forEach.call(touches, function (_touch) {
            var touch = getTouch(_touch);
            savedTouches.push(touch);
            ctx.beginPath();
            ctx.fillStyle = touch.color;
            ctx.arc(touch.x, touch.y, 4, 0, 2 * Math.PI, false);
            ctx.fill();
        });
        return false;
    },
// moves
    moveHandler = function (e) {
        e.preventDefault();
        var touches = isMobile ? e.changedTouches : [e];
        Array.prototype.forEach.call(touches, function (_touch) {
            var touch = getTouch(_touch);
            var id = getTouchIndex(touch.id);
            if (id >= 0) {
                touch.color = savedTouches[id].color;
                ctx.beginPath();
                ctx.moveTo(savedTouches[id].x, savedTouches[id].y);
                ctx.lineTo(touch.x, touch.y);
                ctx.lineWidth = 4;
                ctx.strokeStyle = touch.color;
                ctx.stroke();
                savedTouches.splice(id, 1, touch);
            }
        });
        return false;
    },
// click or touch releases
    endHandler = function (e) {
        e.preventDefault();
        var touches = isMobile ? e.changedTouches : [e];
        Array.prototype.forEach.call(touches, function (_touch) {
            var touch = getTouch(_touch);
            var id = getTouchIndex(touch.id);
            if (id >= 0) {
                touch.color = savedTouches[id].color;
                ctx.beginPath();
                ctx.moveTo(savedTouches[id].x, savedTouches[id].y);
                ctx.lineTo(touch.x, touch.y);
                ctx.lineWidth = 4;
                ctx.fillStyle = touch.color;
                ctx.stroke();
                // and a square at the end
                ctx.fillRect(touch.x - 4, touch.y - 4, 8, 8);
                // remove this touch
                savedTouches.splice(id, 1);
            }
        });
        return false;
    };
// bind
canvas.addEventListener(startEvent, startHandler, false);
canvas.addEventListener(moveEvent, moveHandler, false);
canvas.addEventListener(endEvent, endHandler, false);
canvas.addEventListener("touchcancel", endHandler, false);
canvas.addEventListener("touchleave", endHandler, false);
canvas.addEventListener("mouseout", endHandler, false);
