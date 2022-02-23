/**
 * @since 2022-02-23
 * @author vivaxy
 */
const { schema } = require('prosemirror-schema-basic');
const { Node } = require('prosemirror-model');

const doc = schema.node('doc', null, [schema.text('abc')]);

const json = doc.toJSON();
const docFromJSON = Node.fromJSON(schema, json);
console.log(docFromJSON.toJSON());
