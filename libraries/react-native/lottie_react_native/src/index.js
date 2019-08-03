/**
 * @since 2017-04-25 15:27:23
 * @author vivaxy
 */

import React, { Component } from 'react';
import Animation from 'lottie-react-native';
import { StyleSheet } from 'react-native';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.setAnimationRef = this.setAnimationRef.bind(this);
  }

  componentDidMount() {
    this.animation.play();
  }

  setAnimationRef(ref) {
    this.animation = ref;
  }

  render() {
    return (
      <Animation
        loop
        ref={this.setAnimationRef}
        style={styles.animation}
        source={require('./navidad.json')}
      />
    );
  }
}

const styles = StyleSheet.create({
  animation: {
    flex: 1,
  },
});
