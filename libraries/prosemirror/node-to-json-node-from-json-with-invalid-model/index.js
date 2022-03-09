/**
 * @since 2022-02-23
 * @author vivaxy
 */
const { schema } = require('prosemirror-schema-basic');
const { Node, Fragment } = require('prosemirror-model');

const doc = schema.node('doc', null, [schema.node('paragraph')]);
doc.content = Fragment.from(schema.text('123'));

const json = doc.toJSON();
const docFromJSON = Node.fromJSON(schema, json);
console.log(docFromJSON.toJSON());
