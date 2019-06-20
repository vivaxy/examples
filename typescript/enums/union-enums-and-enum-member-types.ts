/**
 * @since 2019-06-20 16:33
 * @author vivaxy
 */
enum E {
  Foo,
  Bar,
}

function f(x: E) {
  // if (x !== E.Foo || x !== E.Bar) {
    //               ~~~~~~~~~~~
    // error TS2367: This condition will always return 'true' since the types 'E.Foo' and 'E.Bar' have no overlap.
  // }
}
