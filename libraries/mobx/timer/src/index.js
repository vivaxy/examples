import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import AppState from './AppState';
import App from './App';
import './index.css';

const appState = new AppState();

render(<App appState={appState} />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    render(
      <AppContainer>
        <NextApp appState={appState} />
      </AppContainer>,
      document.getElementById('root'),
    );
  });
}
