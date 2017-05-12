/**
 * @since 2017-05-12 12:07:09
 * @author vivaxy
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import createReducer from '../lib/createReducer';

class Footer extends Component {

    constructor(props) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(e) {
        const { updateInputValue } = this.props;
        updateInputValue(e.target.value);
    }

    render() {
        const { inputValue, addCount, errorMessage } = this.props;
        return (
            <div>
                <input value={inputValue} onChange={this.handleInputChange} />
                <button onClick={addCount}>add</button>
                <div>{errorMessage}</div>
            </div>
        );
    }
}

const ACTIONS = {
    FOOTER_INPUT_CHANGE: 'FOOTER_INPUT_CHANGE',
    FOOTER_ERROR_MESSAGE: 'FOOTER_ERROR_MESSAGE',
};
const HEADER_ACTIONS = {
    HEADER_ADD_COUNT: 'HEADER_ADD_COUNT',
};
const DEFAULT_STATE = {
    inputValue: 0,
    errorMessage: '',
};
export const reducer = createReducer(DEFAULT_STATE, {
    [ACTIONS.FOOTER_INPUT_CHANGE]: (state, action) => {
        return {
            ...state,
            inputValue: action.payload,
            errorMessage: '',
        };
    },
    [ACTIONS.FOOTER_ERROR_MESSAGE]: (state, action) => {
        return {
            ...state,
            errorMessage: action.payload,
        };
    },
    [HEADER_ACTIONS.HEADER_ADD_COUNT]: (state, action) => {
        return {
            ...state,
            ...DEFAULT_STATE,
        }
    },
});
const mapDispatchToProps = {
    updateInputValue: (value) => {
        return (dispatch) => {
            dispatch({
                type: ACTIONS.FOOTER_INPUT_CHANGE,
                payload: value,
            });
        };
    },
    addCount: () => {
        return (dispatch, getState) => {
            const numberValue = Number(getState()[Footer.name].inputValue);
            if (isNaN(numberValue)) {
                dispatch({
                    type: ACTIONS.FOOTER_ERROR_MESSAGE,
                    payload: '请输入数字',
                });
            } else {
                dispatch({
                    type: HEADER_ACTIONS.HEADER_ADD_COUNT,
                    payload: numberValue,
                });
            }
        };
    },
};
const mapStateToProps = (state) => {
    const { inputValue, errorMessage } = state[Footer.name];
    return { inputValue, errorMessage };
};
export default connect(mapStateToProps, mapDispatchToProps)(Footer);
