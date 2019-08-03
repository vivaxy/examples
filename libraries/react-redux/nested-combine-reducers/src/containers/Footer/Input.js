/**
 * @since 2017-05-13 10:35:06
 * @author vivaxy
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import actions from '../../actions';

class Input extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    const { updateValue } = this.props;
    updateValue(e.target.value);
  }

  render() {
    const { value } = this.props;
    return <input value={value} onChange={this.handleInputChange} />;
  }
}

const mapStateToProps = (state) => {
  const { value } = state.footer.input;
  return { value };
};
export default connect(
  mapStateToProps,
  actions.footer.input,
)(Input);
