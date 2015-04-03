var Example = React.createClass({displayName: "Example",
    render: function () {
        return (
            React.createElement("a", {href: this.props.data.link}, this.props.data.name)
        );
    }
});

var ExampleList = React.createClass({displayName: "ExampleList",
    componentDidMount: function () {
        var _this = this;
        new Ajax({
            url: './data/examples.json'
        }).on('success', function (data) {
            _this.setState({
                data: JSON.parse(data)
            });
        }).send();
    },
    getInitialState: function () {
        // initial state
        return {
            data: [{
                link: '#',
                name: 'loading'
            }]
        };
    },
    render: function () {
        var list = this.state.data.map(function (a) {
            return (
                React.createElement("li", null, React.createElement(Example, {data: a}))
            );
        });
        return (
            React.createElement("ul", null, 
                list
            )
        );
    }
});

React.render(
    React.createElement(ExampleList, null),
    document.querySelector('.content')
);
