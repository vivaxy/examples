/**
 * @since 2017-05-09 10:20:57
 * @author vivaxy
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class AppIntro extends Component {

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
                AppIntro: {
                    count: 1,
                },
            };
        }, (actions) => {
            return {
                ...actions,
                AppIntro: {
                    add: () => {
                        return (dispatch, state) => {
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
                                    ...state.AppIntro,
                                    count: state.AppIntro.count - 1,
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
            <div className="App-intro">
                To get started, edit <code>src/App.js</code> and save to reload.
                <p>{store.AppIntro.count}</p>
                <p onClick={() => {
                    actions.AppIntro.minus();
                }}>minus</p>
            </div>
        );
    }
}
