/**
 * @since 2017-05-09 10:19:25
 * @author vivaxy
 */

import React from 'react';

import BaseComponent from './BaseComponent';
import logo from './logo.svg';

export default class AppHeader extends BaseComponent {
  state = {
    count: 1,
  };

  componentDidMount() {
    this.on('minus', (value) => {
      this.setState({
        count: this.state.count - value,
      });
    });
    super.componentDidMount();
  }

  render() {
    const { count } = this.state;
    return (
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h2>Welcome to React</h2>
        <p>{count}</p>
        <p
          onClick={() => {
            this.emit('add', 1);
            this.setState({
              count: this.state.count + 1,
            });
          }}
        >
          add
        </p>
      </div>
    );
  }
}
