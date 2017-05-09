/**
 * @since 2017-05-09 10:20:57
 * @author vivaxy
 */

import React, { Component } from 'react';

export default class AppIntro extends Component {

    render() {
        const { count, action } = this.props;
        return (
            <div className="App-intro">
                To get started, edit <code>src/App.js</code> and save to reload.
                <p>{count}</p>
                <p onClick={() => {
                    action((state) => {
                        return {
                            ...state,
                            count: state.count - 1,
                        };
                    });
                }}>minus</p>
            </div>
        );
    }
}
