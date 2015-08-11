/**
 * @since 15-08-11 17:16
 * @author vivaxy
 */
var Stack = function () {
    this.top = null;
    this.size = 0;
};

Stack.prototype = {
    constructor: Stack,
    push: function (data) {
        this.top = {
            data: data,
            next: this.top
        };
        this.size++;
        return this.size;
    },
    peek: function () {
        return this.top ? this.top.data : null;
    },
    pop: function () {
        if (this.top === null) return null;

        var out = this.top;
        this.top = this.top.next;

        if (this.size > 0) this.size--;

        return out.data;
    },
    clear: function () {
        this.top = null;
        this.size = 0;
        return this.size;
    },
    displayAll: function () {
        if (this.top === null) return null;

        var arr = [];
        var current = this.top;

        for (var i = 0, len = this.size; i < len; i++) {
            arr[i] = current.data;
            current = current.next;
        }

        return arr;
    }
};
