import React, { Component } from 'react';

import Input from './Footer/Input';
import Button from './Footer/Button';
import Error from './Footer/Error';

class Footer extends Component {
  render() {
    return (
      <div>
        <Input />
        <Button />
        <Error />
      </div>
    );
  }
}

export default Footer;
