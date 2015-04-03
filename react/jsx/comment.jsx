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

var CommentList = React.createClass({
    render: function () {
        var commentNodes = this.props.data.map(function (comment) {
            return (
                <Comment author={comment.author}>
                    {comment.text}
                </Comment>
            );
        });
        return (
            <div>
                {commentNodes}
            </div>
        );
    }
});

var CommentForm = React.createClass({
    render: function () {
        return (
            <div>
                Hello, world! I am a CommentForm.
            </div>
        );
    }
});

var Comment = React.createClass({
    render: function () {
        return (
            <div>
                <h2>
                    {this.props.author}
                </h2>
                    {this.props.children}
            </div>
        );
    }
});

var CommentBox = React.createClass({
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
            <div>
                <h1>Comments</h1>
                <CommentList data={this.state.data}/>
                <CommentForm />
            </div>
        );
    }
});

React.render(
    <CommentBox url="../data/comment.json" />,
    document.querySelector('.content')
);
