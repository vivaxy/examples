import React, { Component } from 'react';
import './App.css';

import AppHeader from './AppHeader';
import AppIntro from './AppIntro';
import events from './events';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <AppHeader events={events} />
        <AppIntro events={events} />
      </div>
    );
  }
}
