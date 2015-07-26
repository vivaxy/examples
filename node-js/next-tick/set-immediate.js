/**
 * @since 15-07-25 13:04
 * @author vivaxy
 */
setImmediate(function () {
    console.log(4);
    process.nextTick(function () {
        console.log(6);
    });
    console.log(5);
});
process.nextTick(function () {
    console.log(2);
    setImmediate(function () {
        console.log(7);
    });
    console.log(3);
});
console.log(1);
