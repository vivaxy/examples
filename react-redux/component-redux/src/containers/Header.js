/**
 * @since 2017-05-12 12:06:53
 * @author vivaxy
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import createReducer from '../lib/createReducer';

class Header extends Component {
    render() {
        const { count, clear } = this.props;
        return (
            <div>
                <span>{count}</span>
                <button style={styles.button} onClick={clear}>clear</button>
            </div>
        );
    }
}

const styles = {
    button: {
        marginLeft: 125,
    },
};

const ACTION_TYPES = {
    HEADER_CLEAR: 'HEADER_CLEAR',
    HEADER_ADD_COUNT: 'HEADER_ADD_COUNT',
};
const DEFAULT_STATE = {
    count: 1,
};
export const reducer = createReducer(DEFAULT_STATE, {
    [ACTION_TYPES.HEADER_CLEAR]: (state) => {
        return {
            ...state,
            DEFAULT_STATE,
        };
    },
    [ACTION_TYPES.HEADER_ADD_COUNT]: (state, action) => {
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
                type: ACTION_TYPES.HEADER_CLEAR,
            });
        };
    },
};
const mapStateToProps = (state) => {
    const { count } = state[Header.name];
    return { count };
};
export default connect(mapStateToProps, mapDispatchToProps)(Header);
