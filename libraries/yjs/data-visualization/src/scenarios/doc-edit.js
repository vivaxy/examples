/**
 * @since 2021-06-25
 * @author vivaxy
 */
import * as E from '../enums/event-types.js';
import * as EDIT_TYPES from '../enums/edit-types.js';

const DocEdit = [
  [E.DOC_OPEN],
  [
    E.DOC_UPDATE,
    {
      id: 0,
      type: EDIT_TYPES.INSERT,
      pos: 0,
      str: 'FOO',
    },
  ],
  [
    E.DOC_UPDATE,
    {
      id: 0,
      type: EDIT_TYPES.DELETE,
      pos: 1,
      len: 1,
    },
  ],
  [
    E.DOC_UPDATE,
    {
      id: 0,
      type: EDIT_TYPES.INSERT,
      pos: 1,
      str: 'T',
    },
  ],
  [
    E.DOC_UPDATE,
    {
      id: 0,
      type: EDIT_TYPES.INSERT,
      pos: 1,
      str: 'B',
    },
  ],
];

export default DocEdit;
