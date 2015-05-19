/**
 * @since 150519 19:53
 * @author vivaxy
 */
// http://leeluolee.github.io/2015/04/13/function-to-string/
var workerify = function (functionObject) {
        return new Worker(
            URL.createObjectURL(
                new Blob(
                    [
                        'self.onmessage = ' + functionObject.toString()
                    ],
                    {
                        type: 'application/javascript'
                    }
                )
            )
        );
    },
    compute = function (withWorker) {
        var value = parseInt(num.value || 0, 10);
        if (withWorker) {
            console.time('with-worker');
            var worker = workerify(function (e) {
                var fibonacci = function (n) {
                    if (n < 2) return n;
                    return fibonacci(n - 1) + fibonacci(n - 2);
                };
                return self.postMessage(fibonacci(e.data));
            });
            worker.postMessage(value);
            worker.addEventListener('message', function (e) {
                result.textContent = e.data;
                console.timeEnd('with-worker');
            }, false);
        } else {
            console.time('without-worker');
            var fibonacci = function (n) {
                if (n < 2) return n;
                return fibonacci(n - 1) + fibonacci(n - 2);
            };
            result.textContent = fibonacci(value);
            console.timeEnd('without-worker');
        }
    },
    num = document.getElementById("num"),
    result = document.getElementById('result');
