/**
 * @since 2017-05-13 10:35:10
 * @author vivaxy
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import actions from '../../actions';

class Button extends Component {
    render() {
        const { addCount } = this.props;
        return (
            <button onClick={addCount}>add</button>
        );
    }
}

const mapStateToProps = () => {
    return null;
};
export default connect(mapStateToProps, actions.footer.button)(Button);
