/**
 * @since 2017-05-09 10:20:57
 * @author vivaxy
 */

import React, { Component } from 'react';

export default class AppIntro extends Component {
  state = {
    count: 1,
  };

  componentDidMount() {
    const { events } = this.props;
    events.on('add', (value) => {
      this.setState({
        count: this.state.count + value,
      });
    });
  }

  render() {
    const { events } = this.props;
    const { count } = this.state;
    return (
      <div className="App-intro">
        To get started, edit <code>src/App.js</code> and save to reload.
        <p>{count}</p>
        <p
          onClick={() => {
            events.emit('minus', 1);
            this.setState({
              count: this.state.count - 1,
            });
          }}
        >
          minus
        </p>
      </div>
    );
  }
}
