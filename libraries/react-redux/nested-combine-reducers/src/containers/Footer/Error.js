/**
 * @since 2017-05-13 10:52:53
 * @author vivaxy
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

class Error extends Component {
  render() {
    const { message } = this.props;
    return <div>{message}</div>;
  }
}

const mapStateToProps = (state) => {
  const { message } = state.footer.error;
  return { message };
};
export default connect(
  mapStateToProps,
  {},
)(Error);
