/**
 * @since 150513 16:29
 * @author vivaxy
 */
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var savedData = {};
var max = 10;
var min = 10;
var maxValue = 0;
var minValue = 0;
var drop = function (value) {
    if (value > max) {
        max = value;
    }
    if (value < max) {
        min = value;
    }
    if (savedData[value] === undefined) {
        savedData[value] = 0;
    }
    savedData[value]++;
    if (savedData[value] > maxValue) {
        maxValue = savedData[value];
    }
    if (savedData[value] < minValue) {
        minValue = savedData[value];
    }
    ctx.fillRect(value, canvas.height - savedData[value], 1, 1);
};
var test = function () {
    var array = [];
    var times = 0;
    for (var i = 0; i < 6; i++) {
        array.push(false);
    }
    while (!array.every(function (item) {
        return item === true;
    })) {
        var random = Math.floor(Math.random() * 6);
        array[random] = true;
        times++;
    }
    return times;
};

canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight;

setInterval(function () {
    drop(test());
}, 0);
