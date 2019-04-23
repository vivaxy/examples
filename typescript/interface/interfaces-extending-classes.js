/**
 * @since 2019-04-23 01:11
 * @author vivaxy
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Control = /** @class */ (function () {
    function Control() {
    }
    return Control;
}());
var Button = /** @class */ (function (_super) {
    __extends(Button, _super);
    function Button() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Button.prototype.select = function () { };
    return Button;
}(Control));
var TextBox = /** @class */ (function (_super) {
    __extends(TextBox, _super);
    function TextBox() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextBox.prototype.select = function () { };
    return TextBox;
}(Control));
// Class 'Image1' incorrectly implements interface 'SelectableControl'.
// Types have separate declarations of a private property 'state'.
var Image1 = /** @class */ (function () {
    function Image1() {
    }
    Image1.prototype.select = function () { };
    return Image1;
}());
// Class 'Image2' incorrectly implements interface 'SelectableControl'.
// Property 'state' is missing in type 'Image2' but required in type 'SelectableControl'.
var Image2 = /** @class */ (function () {
    function Image2() {
    }
    Image2.prototype.select = function () { };
    return Image2;
}());
