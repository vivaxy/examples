/**
 * @since 2017-05-12 12:06:53
 * @author vivaxy
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import createReducer from '../lib/createReducer';
import * as actionTypes from '../configs/actionTypes';

const styles = {
  button: {
    marginLeft: 125,
  },
};

class Header extends Component {
  render() {
    const { count, clear } = this.props;
    return (
      <div>
        <span>{count}</span>
        <button style={styles.button} onClick={clear}>
          clear
        </button>
      </div>
    );
  }
}

const DEFAULT_STATE = {
  count: 1,
};
export const reducer = createReducer(DEFAULT_STATE, {
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
const mapDispatchToProps = {
  clear: () => {
    return (dispatch) => {
      dispatch({
        type: actionTypes.RESET_COUNT,
      });
    };
  },
};
const mapStateToProps = (state) => {
  const { count } = state[Header.name];
  return { count };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Header);
