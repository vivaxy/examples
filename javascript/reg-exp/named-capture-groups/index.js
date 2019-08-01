/**
 * @since 2019-08-01 11:52
 * @author vivaxy
 */
// 命名捕获组 // ?<name>
const namedCaptureGroups = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const result = namedCaptureGroups.exec('2020-03-04');
const [match, year, month, day] = result;

console.log('result', result); // → ["2020-03-04", "2020", "03", "04", groups: { day: "04", month: "03", year: "2020" }, index: 0, input: "2020-03-04"]
console.log('match', match); // → 2020-03-04
console.log('year', year); // → 2020
console.log('month', month); // → 03
console.log('day', day); // → 04

// \1 代表 (\w\w) 匹配的内容而非 (\w\w) 本身，所以当 (\w\w) 匹配了 'ab' 后，\1 表示的就是对 'ab' 的匹配了
console.log("/(\\w\\w)\\1/.test('abab')", /(\w\w)\1/.test('abab')); // → true
console.log(
  "/(?<ab>\\w\\w)\\k<ab>/.test('abab')",
  /(?<ab>\w\w)\k<ab>/.test('abab'),
); // → true
