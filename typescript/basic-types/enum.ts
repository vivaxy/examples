/**
 * @since 2019-04-16 04:13
 * @author vivaxy
 */
enum Color {
  Red,
  Green,
  Blue,
}
const c: Color = Color.Green;
console.log(c);

enum Color2 {
  Red = 1,
  Green,
  Blue,
}
const c2: Color2 = Color2.Red;
console.log(c2);
