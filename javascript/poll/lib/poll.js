/**
 * @since 150628 11:19
 * @author vivaxy
 */
/**
 * `callback` will be called only once, only if `func` returns `true` without `timeout`.
 * `func` will be checked every `interval`, if not `timeout` or `callback` not called.
 * @param func - determines whether success or not; if success, `callback` will be called
 * @param callback - finally called callback
 * @param errCallback - timeout callback
 * @param timeout - timeout means error
 * @param interval - time to call `func` to check success or not
 */
var poll = function (func, callback, errCallback, timeout, interval) {

    var endTime = new Date().getTime() + (timeout || 2000);
    interval = interval || 100;

    (function p() {
        if (func()) {         // 如果条件满足，则执行！
            callback();
        } else if (new Date().getTime() < endTime) {        // 如果条件不满足，但并未超时，再来一次
            setTimeout(p, interval);
        } else {        // 不匹配且时间消耗过长，则拒绝！
            errCallback(new Error('timed out for ' + func + ': ' + arguments));
        }
    })();
};
