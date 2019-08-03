/**
 * @since 2017-05-09 19:57:24
 * @author vivaxy
 */

import React, { Component } from 'react';

class AppChildChild extends Component {
  render() {
    return (
      <code onClick={this.props.update}>src/App.js {this.props.count}</code>
    );
  }
}

export default AppChildChild;
