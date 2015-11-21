/**
 * @since 2015-11-21 13:49
 * @author vivaxy
 */
'use strict';
var eventSource;
if (!!window.EventSource) {
    eventSource = new EventSource(location.origin + '/event-source');
} else {
    // notify use that her browser doesn't support SSE
    console.log('`EventSource` is not supported');
}

eventSource.addEventListener('open', function () {
    // Connection was opened.
    console.log('open', arguments);
});

eventSource.addEventListener('create', function () {
    // do something with data
    console.log('create', arguments);
});

eventSource.addEventListener('update', function () {
    // do something with data
    console.log('update', arguments);
});

eventSource.addEventListener('error', function (e) {
    if (e.readyState === EventSource.CLOSED) {
        // Connection was closed.
        
    }
    console.log('error', arguments);
});
