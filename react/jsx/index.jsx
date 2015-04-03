var Example = React.createClass({
    render: function () {
        return (
            <a href={this.props.data.link}>{this.props.data.name}</a>
        );
    }
});

var ExampleList = React.createClass({
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
                <li><Example data={a} /></li>
            );
        });
        return (
            <ul>
                {list}
            </ul>
        );
    }
});

React.render(
    <ExampleList />,
    document.querySelector('.content')
);
