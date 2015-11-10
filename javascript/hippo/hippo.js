/**
 * @since 2015-10-19 11:48
 * @author vivaxy
 */
'use strict';
window._hippoImageList = [];
(function () {
    var hippo = window.hippo = window.hippo || [];
    var next = function () {
        hippo.shift();
        if (hippo.length > 0) {
            send();
        }
        return hippo;
    };
    var send = function (method, subMethod) {
        var remote = './remote.json';
        var data = hippo[0];
        switch (method) {
            case 'ajax':
                var xhr = new XMLHttpRequest();
                xhr.addEventListener('readystatechange', function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                            // 2** is valid response status, and 304 means get from the cache
                            // done
                            return next();
                        } else {
                            // resend
                            return send('dom');
                        }
                    }
                });
                switch (subMethod) {
                    case 'post':
                        // post
                        xhr.open('POST', remote);
                        xhr.send(JSON.stringify(data));
                        break;
                    default:
                        // get
                        xhr.open('GET', remote + '?data=' + JSON.stringify(data));
                        xhr.send();
                        break;
                }
                break;
            case 'dom':
                switch (subMethod) {
                    case 'iframe':
                        // iframe
                        var iframe = document.createElement('iframe');
                        iframe.addEventListener('load', function () {
                            document.body.removeChild(iframe);
                            next();
                        });
                        iframe.src = remote + '?data=' + JSON.stringify(data);
                        iframe.style.display = 'none';
                        document.body.appendChild(iframe);
                        break;
                    default:
                        // image
                        var image = new Image();
                        var fromImageToNext = function () {
                            var index = _hippoImageList.indexOf(image);
                            _hippoImageList.splice(index, 1);
                            next();
                        };
                        image.addEventListener('load', fromImageToNext);
                        image.addEventListener('error', fromImageToNext);
                        image.addEventListener('abort', fromImageToNext);
                        image.src = remote + '?data=' + JSON.stringify(data);
                        // fix GC
                        _hippoImageList.push(image);
                        break;
                }
                break;
            default:
                // send beacon
                if (navigator.sendBeacon) {
                    if (navigator.sendBeacon(remote, JSON.stringify(data))) {
                        // done
                        return next();
                    } else {
                        // resend
                        return send('dom');
                    }
                } else {
                    // resend
                    return send('dom');
                }
                break;
        }
        return hippo;
    };
    hippo.push = function () {
        Array.prototype.push.apply(hippo, arguments);
        send();
        return hippo;
    };
    document.addEventListener('beforeunload', function () {
        // todo save hippo queue
    });
    // finally
    send();
})();
