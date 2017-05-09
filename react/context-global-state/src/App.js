import React, { Component } from 'react';
import './App.css';

import AppHeader from './AppHeader';
import AppIntro from './AppIntro';

export default class App extends Component {

    state = {};

    constructor(props) {
        super(props);
        this.action = this.action.bind(this);
    }

    getChildContext() {
        return {
            state: this.state,
            action: this.action,
        };
    }

    action(dispatch) {
        this.setState(dispatch(this.state));
    }

    render() {
        return (
            <div className="App">
                <AppHeader />
                <AppIntro />
            </div>
        );
    }
}
