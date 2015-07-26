/**
 * @since 150725 10:04
 * @author vivaxy
 */
console.log(1);
process.nextTick(function () {
    console.log(3);
});
setImmediate(function () {
    console.log(5);
});
process.nextTick(function () {
    console.log(4);
});
console.log(2);
