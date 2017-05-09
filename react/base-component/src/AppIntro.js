/**
 * @since 2017-05-09 10:20:57
 * @author vivaxy
 */

import React from 'react';

import BaseComponent from './BaseComponent';

export default class AppIntro extends BaseComponent {

    state = {
        count: 1,
    };

    componentDidMount() {
        this.on('add', (value) => {
            this.setState({
                count: this.state.count + value,
            });
        });
        super.componentDidMount();
    }

    render() {
        const { count } = this.state;
        return (
            <div className="App-intro">
                To get started, edit <code>src/App.js</code> and save to reload.
                <p>{count}</p>
                <p onClick={() => {
                    this.emit('minus', 1);
                    this.setState({
                        count: this.state.count - 1,
                    });
                }}>minus</p>
            </div>
        );
    }
}
