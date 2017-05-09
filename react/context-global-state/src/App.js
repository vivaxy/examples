import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './App.css';

import AppHeader from './AppHeader';
import AppIntro from './AppIntro';

const createActionObject = function(obj, actionCreator) {
    const result = {};
    Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (typeof value === 'function') {
            result[key] = actionCreator(value);
        } else if (typeof value === 'object') {
            result[key] = createActionObject(obj[key], actionCreator);
        } else {
            throw new Error('only Function and Object are accepted');
        }
    });
    return result;
};

export default class App extends Component {

    static childContextTypes = {
        initialize: PropTypes.func,
        store: PropTypes.object,
        actions: PropTypes.object,
    };

    state = {};
    actions = {};

    constructor(props, context) {
        super(props, context);
        this.actionCreator = this.actionCreator.bind(this);
        this.initializeStoreAndActions = this.initializeStoreAndActions.bind(this);
    }

    getChildContext() {
        return {
            initialize: this.initializeStoreAndActions,
            store: this.state,
            actions: this.actions,
        };
    }

    initializeStoreAndActions(storeUpdater, actionsUpdater) {
        Object.assign(this.actions, createActionObject(actionsUpdater(this.actions), this.actionCreator));
        Object.assign(this.state, storeUpdater(this.state));
    }

    actionCreator(func) {
        if (func._created) {
            return func;
        }
        const action = (...args) => {
            return func(...args)((state) => {
                return this.setState(state);
            }, this.state);
        };
        action._created = true;
        return action;
    }

    render() {
        return (
            <div className="App">
                <AppHeader />
                <AppIntro />
            </div>
        );
    }
}
