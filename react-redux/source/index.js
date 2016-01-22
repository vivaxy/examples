/**
 * @since 2016-01-22 14:30
 * @author vivaxy
 */

'use strict';

import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux'

import todoApp from './reducers';
import App from './containers/app.js';

let store = createStore(todoApp);

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.querySelector('.js-container')
);
