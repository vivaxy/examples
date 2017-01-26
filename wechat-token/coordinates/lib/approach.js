/**
 * @since 150611 13:43
 * @author vivaxy
 */

var approach = function(from, to, req, callback) {
    console.log('ranging: from ' + from + ' to ' + to);
    var next = (from + to) / 2;
    if (from.toFixed(5) === to.toFixed(5)) {
        return callback && callback(next.toFixed(5));
    }
    req(from, function(result1) {
        req(next, function(result2) {
            if (result1 === result2) {
                return approach(next, to, req, callback);
            } else {
                return approach(from, next, req, callback);
            }
        });
    });
    // },
    // request = function (value, callback) {
    //     callback(value < 12);
};

//approach(0, 100, request);

module.exports = approach;
