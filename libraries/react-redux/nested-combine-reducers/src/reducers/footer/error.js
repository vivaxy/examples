/**
 * @since 2017-05-13 10:53:09
 * @author vivaxy
 */

import * as actionTypes from '../../configs/actionTypes';
import createReducer from '../../lib/createReducer';

const DEFAULT_STATE = {
  message: '',
};

export default createReducer(DEFAULT_STATE, {
  [actionTypes.UPDATE_FORM_INPUT]: (state, action) => {
    return {
      ...state,
      ...DEFAULT_STATE,
    };
  },
  [actionTypes.UPDATE_FORM_ERROR]: (state, action) => {
    return {
      ...state,
      message: action.payload,
    };
  },
  [actionTypes.ADD_VALUE_TO_COUNT]: (state, action) => {
    return {
      ...state,
      ...DEFAULT_STATE,
    };
  },
});
