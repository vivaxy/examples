/**
 * @since 150315 10:13
 * @author vivaxy
 */
var canvasPolyfill = new CanvasPolyfill();
console.log(canvasPolyfill.supported);
canvasPolyfill.convert();

var canvas = document.getElementsByTagName('canvas')[0];
var ctx = canvas.getContext('2d');
ctx.font = '32px "Arial"';
ctx.textAlign = 'center';
ctx.fillStyle = 'rgb(100, 100, 100)';
ctx.textBaseline = 'middle';
ctx.fillText('canvas test', canvas.width / 2, canvas.height / 2);
