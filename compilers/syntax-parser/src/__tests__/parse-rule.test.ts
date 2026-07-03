import parseRule from '../parse-rule';

test('parse simple rule', function () {
  expect(
    parseRule(`
String ::= /[a-z][A-Z][0-9]/;
Null ::= 'null';
NullAndUndefined ::= Null 'undefined';
NullOrUndefined ::= Null | 'undefined'
`),
  ).toMatchSnapshot();
});
