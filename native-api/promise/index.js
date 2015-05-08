/**
 * @since 150508 13:45
 * @author vivaxy
 */
'use strict';

// A-> $http function is implemented in order to follow the standard Adapter pattern
var http = function (url) {
    // Method that performs the ajax request
    var ajax = function (method, url, args) {
        // Creating a promise
        return new Promise(function (resolve, reject) {
            // Instantiates the XMLHttpRequest
            var client = new XMLHttpRequest(),
                uri = url;
            if (args && (method === 'POST' || method === 'PUT')) {
                uri += '?';
                var argcount = 0;
                for (var key in args) {
                    if (args.hasOwnProperty(key)) {
                        if (argcount++) {
                            uri += '&';
                        }
                        uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
                    }
                }
            }
            client.open(method, uri);
            client.send();
            client.onload = function () {
                if (this.status == 200) {
                    // Performs the function "resolve" when this.status is equal to 200
                    resolve(this.response);
                } else {
                    // Performs the function "reject" when this.status is different than 200
                    reject({status: this.statusText});
                }
            };
            client.onerror = function () {
                reject(this.statusText);
            };
        });
    };
    // Adapter pattern
    return {
        'get': function (args) {
            return ajax('GET', url, args);
        },
        'post': function (args) {
            return ajax('POST', url, args);
        },
        'put': function (args) {
            return ajax('PUT', url, args);
        },
        'delete': function (args) {
            return ajax('DELETE', url, args);
        }
    };
};
// End A
// B-> Here you define its functions and its payload
var mdnAPI = 'https://developer.mozilla.org/en-US/search.jsn';
var payload = {
    'topic': 'js',
    'q': 'Promise'
};
var callback = {
    success: function (data) {
        console.log(1, 'success', JSON.parse(data));
    },
    error: function (data) {
        console.log(2, 'error', JSON.parse(data));
    }
};
// End B
// Executes the method call
http(mdnAPI)
    .get(payload)
    .then(callback.success)
    .catch(callback.error);
