import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import Header from './containers/Header';
import Footer from './containers/Footer';
import reducers from './reducers';

const store = createStore(
  reducers,
  compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : (f) => f,
  ),
);

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div>
          <Header />
          <Footer />
        </div>
      </Provider>
    );
  }
}

export default App;
