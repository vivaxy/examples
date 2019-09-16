import React, { Component } from 'react';
import PropTypes, { InferProps } from 'prop-types';

export default class Title extends Component<
  InferProps<typeof Title.propTypes>
> {
  static propTypes = {
    requiredProp: PropTypes.string.isRequired,
    optionalProp: PropTypes.string,
  };

  static defaultProps = {
    optionalProp: 'optional value',
  };

  render() {
    const { requiredProp, optionalProp } = this.props;
    return (
      <div>
        requiredProp: {requiredProp}, optionalProp: {optionalProp}
      </div>
    );
  }
}
