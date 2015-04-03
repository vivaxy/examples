var CommentBox = React.createClass({
    render: function() {
        return (
            <ul>
                Hello, world!
            </ul>
        );
    }
});
React.render(
    <CommentBox />,
    document.querySelector('.content')
);
