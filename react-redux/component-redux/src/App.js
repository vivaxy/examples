import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import componentConfig from './configs/components';

const reducers = componentConfig.reduce((acc, { componentClass, reducer }) => {
    return {
        ...acc,
        [componentClass.WrappedComponent.name]: reducer,
    };
}, {});
const store = createStore(combineReducers(reducers), compose(applyMiddleware(thunk), window.devToolsExtension ? window.devToolsExtension() : (f) => f));

const children = componentConfig.reduce((acc, { componentClass: Class }, index) => {
    return [...acc, <Class key={index} />];
}, []);
class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <div>
                    {children}
                </div>
            </Provider>
        );
    }
}

export default App;
