/**
 * @since 2019-04-16 04:31
 * @author vivaxy
 */
function error(message) {
    throw new Error(message);
}
function infiniteLoop() {
    while (true) {
    }
}
function fail() {
    return error('Some error');
}
