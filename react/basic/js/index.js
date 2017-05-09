var Example = React.createClass({
    displayName: 'Example',
    render: function() {
        return (
            React.createElement('a', { href: this.props.data.link }, this.props.data.name)
        );
    }
});

var ExampleList = React.createClass({
    displayName: 'ExampleList',
    componentDidMount: function() {
        var _this = this;
        var ajax = fetch('./data/examples.json')
            .then(function(data) {
                return data.json();
            })
            .then(function(data) {
                _this.setState({
                    data: data
                });
            });
        setTimeout(function() {
            ajax.send();
        }, 2000);
    },
    getInitialState: function() {
        // initial state
        return {
            data: [{
                link: '#',
                name: 'loading'
            }]
        };
    },
    render: function() {
        var list = this.state.data.map(function(a) {
            return (
                React.createElement(Example, { data: a })
            );
        });
        return (
            React.createElement('div', null, list)
        );
    }
});

React.render(
    React.createElement(ExampleList, null),
    document.querySelector('.content')
);
