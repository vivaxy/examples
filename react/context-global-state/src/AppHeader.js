/**
 * @since 2017-05-09 10:19:25
 * @author vivaxy
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import logo from './logo.svg';

export default class AppHeader extends Component {

    static contextTypes = {
        initialize: PropTypes.func,
        store: PropTypes.object,
        actions: PropTypes.object,
    };

    constructor(props, context) {
        super(props, context);
        const { initialize } = context;
        initialize((store) => {
            return {
                ...store,
                AppHeader: {
                    count: 1,
                },
            };
        }, (actions) => {
            return {
                ...actions,
                AppHeader: {
                    add: (data) => {
                        return (dispatch, state) => {
                            console.log(data);
                            dispatch({
                                ...state,
                                AppHeader: {
                                    ...state.AppHeader,
                                    count: state.AppHeader.count + 1,
                                },
                                AppIntro: {
                                    ...state.AppIntro,
                                    count: state.AppIntro.count + 1,
                                },
                            });
                        };
                    },
                    minus: () => {
                        return (dispatch, state) => {
                            dispatch({
                                ...state,
                                AppHeader: {
                                    ...state.AppHeader,
                                    count: state.AppHeader.count - 1,
                                },
                                AppIntro: {
                                    ...state.AppIntro,
                                    count: state.AppIntro.count - 1,
                                },
                            });
                        };
                    },
                },
            };
        });
    }

    render() {
        const { store, actions } = this.context;
        return (
            <div className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h2>Welcome to React</h2>
                <p>{store && store.AppHeader && store.AppHeader.count}</p>
                <p onClick={() => {
                    actions.AppHeader.add('data');
                }}>add</p>
            </div>
        );
    }
}
