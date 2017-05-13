/**
 * @since 2017-05-13 10:57:05
 * @author vivaxy
 */

import * as actionTypes from '../../configs/actionTypes';

export default {
    addCount: () => {
        return (dispatch, getState) => {
            const numberValue = Number(getState().footer.input.value);
            if (isNaN(numberValue)) {
                dispatch({
                    type: actionTypes.UPDATE_FORM_ERROR,
                    payload: '请输入数字',
                });
            } else {
                dispatch({
                    type: actionTypes.ADD_VALUE_TO_COUNT,
                    payload: numberValue,
                });
            }
        };
    },
}
