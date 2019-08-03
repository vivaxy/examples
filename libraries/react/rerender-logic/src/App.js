import React, { Component } from 'react';

import './App.css';
import AppChild from './AppChild';

class App extends Component {
  state = {
    count: 1,
  };

  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
  }

  update() {
    this.setState({
      ...this.state,
      count: this.state.count + 1,
    });
  }

  render() {
    return (
      <div className="App">
        <AppChild update={this.update} count={this.state.count} />
      </div>
    );
  }
}

export default App;
