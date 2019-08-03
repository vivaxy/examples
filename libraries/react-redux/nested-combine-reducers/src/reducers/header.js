/**
 * @since 2017-05-13 10:30:00
 * @author vivaxy
 */

import createReducer from '../lib/createReducer';
import * as actionTypes from '../configs/actionTypes';

const DEFAULT_STATE = {
  count: 1,
};
export default createReducer(DEFAULT_STATE, {
  [actionTypes.RESET_COUNT]: (state) => {
    return {
      ...state,
      ...DEFAULT_STATE,
    };
  },
  [actionTypes.ADD_VALUE_TO_COUNT]: (state, action) => {
    return {
      ...state,
      count: state.count + action.payload,
    };
  },
});
