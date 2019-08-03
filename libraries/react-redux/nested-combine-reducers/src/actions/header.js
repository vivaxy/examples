/**
 * @since 2017-05-13 10:29:05
 * @author vivaxy
 */

import * as actionTypes from '../configs/actionTypes';

export default {
  clear: () => {
    return (dispatch) => {
      dispatch({
        type: actionTypes.RESET_COUNT,
      });
    };
  },
};
