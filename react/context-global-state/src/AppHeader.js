/**
 * @since 2017-05-09 10:19:25
 * @author vivaxy
 */

import React, { Component } from 'react';
import connect from './lib/connect';

class AppHeader extends Component {

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
            <div onClick={() => {
                actions.AppHeader.add('data passed into action in AppHeader');
            }}>
                <p>{store && store.AppHeader && store.AppHeader.count}</p>
                <p>click to add</p>
            </div>
        );
    }
}

export default connect(AppHeader);
