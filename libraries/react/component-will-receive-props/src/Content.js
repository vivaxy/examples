/**
 * @since 2017-05-11 17:57:28
 * @author vivaxy
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Content extends Component {
  static contextTypes = {
    store: PropTypes.object,
  };

  componentWillReceiveProps(nextProps, nextContext) {
    console.log('Content componentWillReceiveProps', nextProps, nextContext);
  }

  render() {
    console.log('Content render');
    return (
      <p className="App-intro">
        To get started, edit <code>src/App.js</code> and save to reload.
      </p>
    );
  }
}
