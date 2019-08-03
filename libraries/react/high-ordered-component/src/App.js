import React, { Component } from 'react';
import './App.css';

import AppHeader from './AppHeader';
import AppIntro from './AppIntro';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <AppHeader />
        <AppIntro />
      </div>
    );
  }
}
