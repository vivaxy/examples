/**
 * @since 2017-05-09 10:19:25
 * @author vivaxy
 */

import React, { Component } from 'react';

import logo from './logo.svg';

import createEventfulComponent from './createEventfulComponent';

class AppHeader extends Component {

    state = {
        count: 1,
    };

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        const minusCount = (value) => {
            this.setState({
                count: this.state.count - value,
            });
        };
        this.on('AppIntro:minus', minusCount);
    }

    handleClick() {
        this.emit('AppHeader:add', 1);
        this.setState({
            count: this.state.count + 1,
        });
    };

    render() {
        const { count } = this.state;
        return (
            <div className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h2>Welcome to React</h2>
                <p>{count}</p>
                <p onClick={this.handleClick}>add</p>
            </div>
        );
    }
}

export default createEventfulComponent(AppHeader);
