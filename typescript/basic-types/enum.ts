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
