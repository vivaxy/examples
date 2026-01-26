/**
 * @since 2022-03-14
 * @author vivaxy
 */
import { Schema } from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';
import { schema as basicSchema } from 'prosemirror-schema-basic';

export default new Schema({
  nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
  marks: basicSchema.spec.marks,
});
