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
export default connect(mapStateToProps, {})(Error);
