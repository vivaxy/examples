var a = 0;
var b = 0;

(function () {
    var a = 1;
    var b = 1;
    if (a === 1) {
        a = 2;
        var b$0 = 2;
        console.log(a, b$0);
    }
    console.log(a, b);
})();

console.log(a, b);
