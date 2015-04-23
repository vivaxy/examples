/**
 * @since 150423 11:07
 * @author vivaxy
 */
importScripts('worker2-string.js');
console.log(self);
self.addEventListener('message', function (e) {
    console.log(e);
    setTimeout(function () {
        self.postMessage(worker2String);
        self.close();
    }, 2000)
}, false);
