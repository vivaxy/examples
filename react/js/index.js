var CommentBox = React.createClass({displayName: "CommentBox",
    render: function() {
        return (
            React.createElement("ul", null, 
                "Hello, world!"
            )
        );
    }
});
React.render(
    React.createElement(CommentBox, null),
    document.querySelector('.content')
);
