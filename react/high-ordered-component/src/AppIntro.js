/**
 * @since 2017-05-09 10:20:57
 * @author vivaxy
 */

import React, { Component } from 'react';

import createEventfulComponent from './createEventfulComponent';

class AppIntro extends Component {

    state = {
        count: 1,
    };

    componentDidMount() {
        const addCount = (value) => {
            this.setState({
                count: this.state.count + value,
            });
        };
        this.on('AppHeader:add', addCount);
    }

    render() {
        const { count } = this.state;
        return (
            <div className="App-intro">
                To get started, edit <code>src/App.js</code> and save to reload.
                <p>{count}</p>
                <p onClick={() => {
                    this.emit('AppIntro:minus', 1);
                    this.setState({
                        count: this.state.count - 1,
                    });
                }}>minus</p>
            </div>
        );
    }
}

export default createEventfulComponent(AppIntro);
