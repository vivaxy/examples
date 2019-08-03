/**
 * @since 2017-05-09 10:19:25
 * @author vivaxy
 */

import React, { Component } from 'react';

import logo from './logo.svg';

export default class AppHeader extends Component {
  state = {
    count: 1,
  };

  componentDidMount() {
    const { events } = this.props;
    events.on('minus', (value) => {
      this.setState({
        count: this.state.count - value,
      });
    });
  }

  render() {
    const { events } = this.props;
    const { count } = this.state;
    return (
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h2>Welcome to React</h2>
        <p>{count}</p>
        <p
          onClick={() => {
            events.emit('add', 1);
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
