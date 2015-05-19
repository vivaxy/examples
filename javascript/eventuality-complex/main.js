/**
 * @since 150125 19:57
 * @author vivaxy
 */

var Test = function () {

    var self = this;

    self.a = 0;

    self.log = function () {
        document.write(self.a + '<br>');
        console.log(self.a);
    };

    eventuality(self);

    // parameters saved from on
    self.on('add', function (data) {
        self.a += data;
        self.log();
    }, 1);

    self.fire('add');
    // will log 1

    self.fire('add', 2);
    // will log 3

    self.on('log', function (data) {
        document.write(JSON.stringify(data) + '<br>');
        console.log(data);
        // data is the event name
    });

    self.fire('log');
    // will log log

    self.fire({
        type: 'log'
    });
    // will log Object {type: "log"}

    self.fire({
        type: 'log',
        parameters: 'string'
    });
    // will log Object {type: "log", parameters: "string"}

};


var test = new Test();
