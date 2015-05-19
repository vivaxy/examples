/**
 * @since 150122 09:43
 * @author vivaxy
 */

var Drag2Load = function (callback) {
    ///**
    // *
    // * @param delay
    // * @param action
    // * @returns {Function}
    // */
    //var throttle = function (delay, action) {
    //  var last = 0;
    //  return function () {
    //    var curr = new Date().getTime();
    //    if (curr - last > delay)
    //      action.apply(this, arguments);
    //    last = curr;
    //  };
    //};
    /**
     * is loading content
     * @type {boolean}
     */
    var loading = false;
    /**
     * set loading container and its status
     */
    var load = function () {
        var loadingContainer = document.querySelector('.j-loading');
        loadingContainer.classList.toggle('hide');
        loading = !loading;
    };
    /**
     * scroll event
     */
    var listener = function () {
        if (!loading && document.body.scrollTop + screen.height > document.body.offsetHeight) {
            load();
            callback(load);
        }
        if (document.body.scrollTop <= 0) {

        }
    };
    /**
     * bind listener
     */
    document.addEventListener('scroll', listener, false);
};
