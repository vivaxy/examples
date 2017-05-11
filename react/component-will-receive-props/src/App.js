import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Content from './Content';

class App extends Component {

    static childContextTypes = {
        store: PropTypes.object,
    };

    getChildContext() {
        return {
            store: {},
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        console.log('App componentWillReceiveProps', nextProps, nextContext);
    }

    render() {
        console.log('App render');
        return (
            <div className="App">
                <div className="App-header">
                    <h2 onClick={() => {
                        this.setState({});
                    }}>
                        click this, will setState to `App` self,
                        triggers `App` render without `componentWillReceiveProps`
                        trigger `Content` render with `componentWillReceiveProps`
                    </h2>
                </div>
                <Content />
            </div>
        );
    }
}

export default App;
