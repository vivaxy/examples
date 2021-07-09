/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { Fragment } from 'prosemirror-model';
import { TextNode } from 'prosemirror-model/src/node';

function exec(funcName) {
  try {
    const doc = schema.nodes.doc[funcName](
      {},
      new Fragment(new TextNode(schema.nodes.text, {}, '123')),
    );
    console.log(funcName, doc.toString());
  } catch (e) {
    console.error(funcName, e);
  }
}

exec('create');
exec('createAndFill');
exec('createChecked');
