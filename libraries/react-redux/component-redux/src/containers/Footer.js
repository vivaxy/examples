/**
 * @since 2017-05-12 12:07:09
 * @author vivaxy
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import createReducer from '../lib/createReducer';
import * as actionTypes from '../configs/actionTypes';

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

const DEFAULT_STATE = {
  inputValue: 0,
  errorMessage: '',
};
export const reducer = createReducer(DEFAULT_STATE, {
  [actionTypes.UPDATE_FORM_INPUT]: (state, action) => {
    return {
      ...state,
      inputValue: action.payload,
      errorMessage: '',
    };
  },
  [actionTypes.UPDATE_FORM_ERROR]: (state, action) => {
    return {
      ...state,
      errorMessage: action.payload,
    };
  },
  [actionTypes.ADD_VALUE_TO_COUNT]: (state, action) => {
    return {
      ...state,
      ...DEFAULT_STATE,
    };
  },
});
const mapDispatchToProps = {
  updateInputValue: (value) => {
    return (dispatch) => {
      dispatch({
        type: actionTypes.UPDATE_FORM_INPUT,
        payload: value,
      });
    };
  },
  addCount: () => {
    return (dispatch, getState) => {
      const numberValue = Number(getState()[Footer.name].inputValue);
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
};
const mapStateToProps = (state) => {
  const { inputValue, errorMessage } = state[Footer.name];
  return { inputValue, errorMessage };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Footer);
