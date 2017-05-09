/**
 * @since 2017-05-09 10:19:25
 * @author vivaxy
 */

import React, { Component } from 'react';

import logo from './logo.svg';

export default class AppHeader extends Component {

    render() {
        const { globalState, action } = this.props;

        return (
            <div className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h2>Welcome to React</h2>
                <p>{globalState.count}</p>
                <p onClick={() => {
                    action((state) => {
                        return {
                            ...state,
                            count: state.count + 1,
                        };
                    });
                }}>add</p>
            </div>
        );
    }
}
