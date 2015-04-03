/**
- CommentBox
  - CommentList
    - Comment
  - CommentForm
 */
var data = [{
    author: "Pete Hunt",
    text: "This is one comment"
}, {
    author: "Jordan Walke",
    text: "This is *another* comment"
}];

var CommentList = React.createClass({displayName: "CommentList",
    render: function () {
        var commentNodes = this.props.data.map(function (comment) {
            return (
                React.createElement(Comment, {author: comment.author}, 
                    comment.text
                )
            );
        });
        return (
            React.createElement("div", null, 
                commentNodes
            )
        );
    }
});

var CommentForm = React.createClass({displayName: "CommentForm",
    render: function () {
        return (
            React.createElement("div", null, 
                "Hello, world! I am a CommentForm."
            )
        );
    }
});

var Comment = React.createClass({displayName: "Comment",
    render: function () {
        return (
            React.createElement("div", null, 
                React.createElement("h2", null, 
                    this.props.author
                ), 
                    this.props.children
            )
        );
    }
});

var CommentBox = React.createClass({displayName: "CommentBox",
    getInitialState: function () {
        return {
            data: []
        };
    },
    componentDidMount: function () {
        var _this = this;
        new Ajax({
            url: '../data/comment.json'
        }).on('success', function (data) {
            _this.setState({
                data: JSON.parse(data)
            });
        }).send();
    },
    render: function () {
        return (
            React.createElement("div", null, 
                React.createElement("h1", null, "Comments"), 
                React.createElement(CommentList, {data: this.state.data}), 
                React.createElement(CommentForm, null)
            )
        );
    }
});

React.render(
    React.createElement(CommentBox, {url: "../data/comment.json"}),
    document.querySelector('.content')
);
