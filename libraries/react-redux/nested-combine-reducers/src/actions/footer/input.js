/**
 * @since 2017-05-13 10:39:10
 * @author vivaxy
 */

import * as actionTypes from '../../configs/actionTypes';

export default {
  updateValue: (value) => {
    return (dispatch) => {
      dispatch({
        type: actionTypes.UPDATE_FORM_INPUT,
        payload: value,
      });
    };
  },
};
