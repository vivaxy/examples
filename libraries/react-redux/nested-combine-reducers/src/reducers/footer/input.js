/**
 * @since 2017-05-13 10:40:54
 * @author vivaxy
 */

import createReducer from '../../lib/createReducer';
import * as actionTypes from '../../configs/actionTypes';

const DEFAULT_STATE = {
  value: 0,
};
export default createReducer(DEFAULT_STATE, {
  [actionTypes.UPDATE_FORM_INPUT]: (state, action) => {
    return {
      ...state,
      value: action.payload,
    };
  },
  [actionTypes.ADD_VALUE_TO_COUNT]: (state, action) => {
    return {
      ...state,
      ...DEFAULT_STATE,
    };
  },
});
