/**
 * @since 2021-06-25
 * @author vivaxy
 */
import * as E from '../enums/event-types.js';
import * as EDIT_TYPES from '../enums/edit-types.js';

export default [
  [E.OPEN_A_NEW_DOC],
  [
    E.DOC_CHANGE,
    {
      id: 0,
      type: EDIT_TYPES.INSERT,
      pos: 0,
      string: 'FOO',
    },
  ],
  [
    E.DOC_CHANGE,
    {
      id: 0,
      type: EDIT_TYPES.DELETE,
      pos: 1,
      length: 1,
    },
  ],
  [
    E.DOC_CHANGE,
    {
      id: 0,
      type: EDIT_TYPES.INSERT,
      pos: 1,
      string: 'T',
    },
  ],
  [
    E.DOC_CHANGE,
    {
      id: 0,
      type: EDIT_TYPES.INSERT,
      pos: 1,
      string: 'B',
    },
  ],
];
