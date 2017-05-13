/**
 * @since 2017-05-12 12:06:53
 * @author vivaxy
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import actions from '../actions';
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
                <button style={styles.button} onClick={clear}>clear</button>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { count } = state.header;
    return { count };
};
export default connect(mapStateToProps, actions.header)(Header);
