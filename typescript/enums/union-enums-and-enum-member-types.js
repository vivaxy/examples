/**
 * @since 2019-06-20 16:33
 * @author vivaxy
 */
var E;
(function (E) {
    E[E["Foo"] = 0] = "Foo";
    E[E["Bar"] = 1] = "Bar";
})(E || (E = {}));
function f(x) {
    // if (x !== E.Foo || x !== E.Bar) {
    //               ~~~~~~~~~~~
    // error TS2367: This condition will always return 'true' since the types 'E.Foo' and 'E.Bar' have no overlap.
    // }
}
