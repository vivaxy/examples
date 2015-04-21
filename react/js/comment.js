/**
 - CommentBox
 - CommentList
 - Comment
 - CommentForm
 */
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
    handleSubmit: function (e) {
        e.preventDefault();
        var author = React.findDOMNode(this.refs.author).value.trim();
        var text = React.findDOMNode(this.refs.text).value.trim();
        if (!text || !author) {
            return;
        }
        this.props.onCommentSubmit({
            author: author,
            text: text
        });
        React.findDOMNode(this.refs.author).value = '';
        React.findDOMNode(this.refs.text).value = '';
        return;
    },
    render: function () {
        return (
            React.createElement("form", {onSubmit: this.handleSubmit, style: {'margin': '10px 0'}}, 
                React.createElement("input", {type: "text", placeholder: "Your name", ref: "author"}), 
                React.createElement("input", {type: "text", placeholder: "Say something...", ref: "text"}), 
                React.createElement("input", {type: "submit", value: "Post"})
            )
        );
    }
});

var Comment = React.createClass({displayName: "Comment",
    render: function () {
        return (
            React.createElement("div", {style: {padding: '10px', border: '1px solid #ddd'}}, 
                React.createElement("h2", {style: {margin: 0}}, 
                    this.props.author
                ), 
                this.props.children
            )
        );
    }
});

var CommentBox = React.createClass({displayName: "CommentBox",
    loadData: function (comment) {
        var _this = this;
        new Ajax({
            url: '../data/comment.json'
        }).on('success', function (data) {
                setTimeout(function () {
                    _this.setState({
                        data: JSON.parse(data)
                    });
                }, 2000);
            }).send(comment);
    },
    handleCommentSubmit: function (comment) {
        var comments = this.state.data;
        var newComments = comments.concat([comment]);
        this.setState({
            data: newComments
        });
        //this.loadData(comment);
    },
    getInitialState: function () {
        // initial state
        return {
            data: [{
                author: "wait",
                text: "loading"
            }]
        };
    },
    componentDidMount: function () {
        // dom rendered
        this.loadData();
    },
    render: function () {
        return (
            React.createElement("div", null, 
                React.createElement("h1", null, "Comments"), 
                React.createElement(CommentList, {data: this.state.data}), 
                React.createElement(CommentForm, {onCommentSubmit: this.handleCommentSubmit})
            )
        );
    }
});

React.render(
    React.createElement(CommentBox, null),
    document.querySelector('.content')
);
