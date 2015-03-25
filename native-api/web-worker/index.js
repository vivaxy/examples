/**
 * @since 2014/8/28 17:24
 * @author vivaxy
 */
var button = document.getElementsByClassName("button")[0];
var output = document.getElementsByClassName("output")[0];
var worker1 = undefined;
var startWebWorker = function () {
    if (worker1 == undefined) {
        worker1 = new Worker("worker1.js");
        worker1.addEventListener("message", showResult, false);
        button.innerHTML = "stop web worker";
        button.removeEventListener("click", startWebWorker, false);
        button.addEventListener("click", stopWebWorker, false);
    }
};
var stopWebWorker = function () {
    if (worker1 == undefined) return;
    worker1.terminate();
    worker1.removeEventListener("message", showResult, false);
    worker1 = undefined;
    button.innerHTML = "start web worker";
    button.removeEventListener("click", stopWebWorker, false);
    button.addEventListener("click", startWebWorker, false);
    output.innerHTML = "";
};
var showResult = function (e) {
    var data = JSON.parse(e.data);
    output.innerHTML = data.timedCount;
};
button.addEventListener("click", startWebWorker, false);