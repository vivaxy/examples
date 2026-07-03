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
