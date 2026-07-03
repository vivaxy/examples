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
