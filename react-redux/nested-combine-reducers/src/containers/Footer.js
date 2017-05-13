/**
 * @since 2017-05-12 12:07:09
 * @author vivaxy
 */

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
