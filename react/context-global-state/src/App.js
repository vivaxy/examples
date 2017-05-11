import React, { Component } from 'react';

import createProvider from './lib/createProvider';

import AppHeader from './AppHeader';
import AppIntro from './AppIntro';

class App extends Component {
    render() {
        return (
            <div className="App">
                <AppHeader />
                <AppIntro />
            </div>
        );
    }
}

export default createProvider(App);
