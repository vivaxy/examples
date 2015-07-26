/**
 * @since 150725 10:05
 * @author vivaxy
 */
console.log(1);
setImmediate(function () {
    console.log(4);
});
process.nextTick(function () {
    console.log(3);
});
setImmediate(function () {
    console.log(5);
});
console.log(2);
