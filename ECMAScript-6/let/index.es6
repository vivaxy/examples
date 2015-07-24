/**
 * @since 150521 19:15
 * @author vivaxy
 */
var a = 0;
let b = 0;

(function () {
    var a = 1;
    let b = 1;
    if (a === 1) {
        a = 2;
        let b = 2;
        console.log(a, b);
    }
    console.log(a, b);
})();

console.log(a, b);
