/**
 * @since 2021-06-25
 * @author vivaxy
 */
import * as E from '../enums/event-types.js';
import * as EDIT_TYPES from '../enums/edit-types.js';

export default [
  [E.OPEN_A_NEW_DOC],
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
    E.SYNC_DOC,
    {
      from: 0,
      to: 1,
    },
  ],
  [
    E.DOC_CHANGE,
    {
      id: 0,
      type: EDIT_TYPES.INSERT,
      pos: 3,
      string: 'B',
    },
  ],
  [
    E.DOC_CHANGE,
    {
      id: 1,
      type: EDIT_TYPES.INSERT,
      pos: 3,
      string: 'T',
    },
  ],
  [
    E.SYNC_DOC,
    {
      from: 1,
      to: 0,
    },
  ],
  [
    E.SYNC_DOC,
    {
      from: 0,
      to: 1,
    },
  ],
];
