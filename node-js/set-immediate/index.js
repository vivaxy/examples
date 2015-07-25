/**
 * @since 150725 10:04
 * @author vivaxy
 */
console.log(1);
setImmediate(function () {
    console.log(3);
});
console.log(2);
