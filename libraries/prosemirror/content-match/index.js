/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { Fragment } from 'prosemirror-model';
import { TextNode } from 'prosemirror-model/src/node';

const docContentMatch = schema.nodes.doc.contentMatch;
const paragraphContentMatch = schema.nodes.paragraph.contentMatch;
const textFragment = new Fragment(new TextNode(schema.nodes.text, {}, '123'));

console.log('contentMatch', paragraphContentMatch);
console.log('validEnd', paragraphContentMatch.validEnd);
console.log('matchType', paragraphContentMatch.matchType(schema.nodes.text));
console.log(
  'matchType',
  paragraphContentMatch.matchType(schema.nodes.paragraph),
);
console.log('matchFragment', paragraphContentMatch.matchFragment(textFragment));
console.log('defaultType', paragraphContentMatch.defaultType);
console.log('fillBefore', paragraphContentMatch.fillBefore(textFragment));
console.log('findWrapping', docContentMatch.findWrapping(schema.nodes.text));
console.log('edgeCount', paragraphContentMatch.edgeCount);
console.log('edge', paragraphContentMatch.edge(0));
