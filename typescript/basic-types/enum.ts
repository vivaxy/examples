/**
 * @since 2019-04-16 04:13
 * @author vivaxy
 */
enum EnumColor {
  Red,
  Green,
  Blue,
}
const c: EnumColor = EnumColor.Green;
console.log(c);

enum EnumColorWithCustomStarter {
  Red = 1,
  Green,
  Blue,
}
const c2: EnumColorWithCustomStarter = EnumColorWithCustomStarter.Red;
console.log(c2);
