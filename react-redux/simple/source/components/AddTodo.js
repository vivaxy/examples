/**
 * @since 2016-01-22 14:25
 * @author vivaxy
 */

'use strict';

import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

export default class AddTodo extends Component {
    render () {
        return (
            <div>
                <input type='text' ref='input'/>
                <button onClick={e => this.handleClick(e)}>
                    Add
                </button>
            </div>
        );
    }

    handleClick () {
        const node = findDOMNode(this.refs.input);
        const text = node.value.trim();
        this.props.onAddClick(text);
        node.value = '';
    }
}

AddTodo.propTypes = {
    onAddClick: PropTypes.func.isRequired
};
