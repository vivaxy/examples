import React, { Component } from 'react';
import './App.css';

import AppHeader from './AppHeader';
import AppIntro from './AppIntro';

export default class App extends Component {

    state = {
        count: 1,
    };

    constructor(props) {
        super(props);
        this.action = this.action.bind(this);
    }

    action(dispatch) {
        this.setState(dispatch(this.state));
    }

    render() {
        const { count } = this.state;
        return (
            <div className="App">
                <AppHeader count={count} action={this.action} />
                <AppIntro count={count} action={this.action} />
            </div>
        );
    }
}
