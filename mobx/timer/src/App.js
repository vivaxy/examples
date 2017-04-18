import React, { Component } from 'react';
import { observer } from 'mobx-react';
import DevTools from 'mobx-react-devtools';

import logo from './logo.svg';
import './App.css';

@observer
class App extends Component {

    constructor(props) {
        super(props);
        this.onReset = this.onReset.bind(this);
    }

    onReset() {
        this.props.appState.resetTimer();
    }

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>Welcome to React</h2>
                </div>
                <p className="App-intro">
                    To get started, edit <code>src/App.js</code> and save to reload.
                </p>
                <button onClick={this.onReset}>
                    Seconds passed: {this.props.appState.timer}
                </button>
                <DevTools />
            </div>
        );
    }
}

export default App;
