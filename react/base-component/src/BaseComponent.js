/**
 * @since 2017-05-09 13:12:13
 * @author vivaxy
 */

import { Component } from 'react';

import events from './events';

export default class BaseComponent extends Component {

    componentDidMount() {
        this.hasMounted = true;
    }

    on(...args) {
        if (!this.hasMounted) {
            events.on(...args);
        } else {
            throw new Error('add event listeners before component mounted');
        }
    }

    emit(...args) {
        if (this.hasMounted) {
            events.emit(...args);
        } else {
            throw new Error('emit events after component mounted');
        }
    }
}
