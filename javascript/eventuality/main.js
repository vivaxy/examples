/**
 * @since 150125 19:57
 * @author vivaxy
 */

// test object
var Test = function () {

    var self = this;

    self.a = 0;

    self.log = function () {
        document.write(self.a + '<br>');
        console.log(self.a);
    };

    // parameters saved from on
    self.on('add', function (data) {
        self.a += data;
        self.log();
    });

    self.fire('add', 1);
    // will log 1

    self.fire('add', 2);
    // will log 3

    self.on('log', function (data) {
        document.write(JSON.stringify(data) + '<br>');
        console.log(data);
        // data is the event name
    });

    self.fire('log', 'string');
    // will log log

};

eventuality(Test.prototype);


var test = new Test();

// test html element
var markElement = document.querySelector('.test');
markElement = eventuality(markElement);
markElement.on('help', function (e) {
    document.write(JSON.stringify(e.data) + '<br>');
    console.log(e.data);
});
markElement.fire('help', 'help-data');

