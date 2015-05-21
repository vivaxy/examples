var f = function (x, ...y) {
    console.log(x * y.length, y);
};

f(3, 'hello', true);
