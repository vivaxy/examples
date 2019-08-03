/**
 * @since 2017-05-09 10:20:57
 * @author vivaxy
 */

import React, { Component } from 'react';

import connect from './lib/connect';

class AppIntro extends Component {
  constructor(props, context) {
    super(props, context);
    const { initialize } = context;
    initialize(
      (store) => {
        return {
          ...store,
          AppIntro: {
            count: 1,
          },
        };
      },
      (actions) => {
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
            minus: (data) => {
              console.log(data);
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
      },
    );
  }

  render() {
    const { store, actions } = this.context;
    return (
      <div
        onClick={() => {
          actions.AppIntro.minus('data passed into action in AppIntro');
        }}
      >
        <p>{store.AppIntro.count}</p>
        <p>click to minus</p>
      </div>
    );
  }
}

export default connect(AppIntro);
