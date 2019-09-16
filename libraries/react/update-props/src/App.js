import React, { Component } from 'react';
import Child1 from './Child1';
import Child2 from './Child2';

export default class App extends Component {
  state = {
    name: 'name',
  };
  render() {
    return (
      <div>
        <Child1 name={this.state.name} />
        <Child2 name={this.state.name} />
      </div>
    );
  }
}
