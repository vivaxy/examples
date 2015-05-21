var a = (b = [1, 2, 3])[0], b = b[2];

console.log(a, b);

var c = (e = {c: 4, e: 5}).c, d = ((d = e.d) === void 0 ? 7 : d), e = ((e = e.e) === void 0 ? 8 : e);

console.log(c, d, e);


var f = function (x) {var x = x.name;
    console.log(x);
};

f({name: 6});
