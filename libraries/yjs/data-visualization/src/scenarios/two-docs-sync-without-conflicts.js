/**
 * @since 2021-06-25
 * @author vivaxy
 */
import * as E from '../enums/event-types.js';
import * as EDIT_TYPES from '../enums/edit-types.js';

export default [
  [E.DOC_OPEN],
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
    E.DOC_SYNC,
    {
      from: 0,
      to: 1,
    },
  ],
  [
    E.DOC_UPDATE,
    {
      id: 1,
      type: EDIT_TYPES.DELETE,
      pos: 1,
      len: 1,
    },
  ],
  [
    E.DOC_UPDATE,
    {
      id: 1,
      type: EDIT_TYPES.INSERT,
      pos: 1,
      str: 'T',
    },
  ],
  [
    E.DOC_SYNC,
    {
      from: 1,
      to: 0,
    },
  ],
];
