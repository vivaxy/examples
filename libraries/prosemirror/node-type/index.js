import { schema } from 'prosemirror-schema-basic';
import { DOMSerializer } from 'prosemirror-model';

function exec(funcName) {
  try {
    const doc = schema.nodes.doc[funcName]({}, null);
    const $fragment = DOMSerializer.fromSchema(schema).serializeFragment(
      doc.content,
    );
    const $parent = document.createElement('div');
    $parent.appendChild($fragment);
    console.log(funcName, `<doc>${$parent.innerHTML}</doc>`);
  } catch (e) {
    console.error(funcName, e);
  }
}

exec('create');
exec('createAndFill');
exec('createChecked');
