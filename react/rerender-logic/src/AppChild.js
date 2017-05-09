/**
 * @since 2017-05-09 19:55:59
 * @author vivaxy
 */
import React, { Component } from 'react';

import AppChildChild from './AppChildChild';

class AppChild extends Component {

    shouldComponentUpdate() {
        return true;
    }

    render() {
        return (
            <p className="App-intro">
                To get started, edit <AppChildChild update={this.props.update} count={this.props.count} /> and save to
                reload.
            </p>
        );
    }
}

export default AppChild;
