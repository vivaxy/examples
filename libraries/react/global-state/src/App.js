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
    const { state } = this;
    return (
      <div className="App">
        <AppHeader globalState={state} action={this.action} />
        <AppIntro globalState={state} action={this.action} />
      </div>
    );
  }
}
