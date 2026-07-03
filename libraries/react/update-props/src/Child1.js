import React, { Component } from 'react';

export default class Child1 extends Component {
  render() {
    return (
      <div>
        <div>{this.props.name}</div>
        <button
          onClick={() => {
            this.props.name = 'name1';
          }}
        >
          Change name
        </button>
      </div>
    );
  }
}
