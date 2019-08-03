/**
 - CommentBox
 - CommentList
 - Comment
 - CommentForm
 */
var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment) {
      return <Comment author={comment.author}>{comment.text}</Comment>;
    });
    return <div>{commentNodes}</div>;
  },
});

var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = React.findDOMNode(this.refs.author).value.trim();
    var text = React.findDOMNode(this.refs.text).value.trim();
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({
      author: author,
      text: text,
    });
    React.findDOMNode(this.refs.author).value = '';
    React.findDOMNode(this.refs.text).value = '';
    return;
  },
  render: function() {
    return (
      <form onSubmit={this.handleSubmit} style={{ margin: '10px 0' }}>
        <input type="text" placeholder="Your name" ref="author" />
        <input type="text" placeholder="Say something..." ref="text" />
        <input type="submit" value="Post" />
      </form>
    );
  },
});

var Comment = React.createClass({
  render: function() {
    return (
      <div style={{ padding: '10px', border: '1px solid #ddd' }}>
        <h2 style={{ margin: 0 }}>{this.props.author}</h2>
        {this.props.children}
      </div>
    );
  },
});

var CommentBox = React.createClass({
  loadData: function(comment) {
    var _this = this;
    new Ajax({
      url: '../data/comment.json',
    })
      .on('success', function(data) {
        setTimeout(function() {
          _this.setState({
            data: JSON.parse(data),
          });
        }, 2000);
      })
      .send(comment);
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    var newComments = comments.concat([comment]);
    this.setState({
      data: newComments,
    });
    //this.loadData(comment);
  },
  getInitialState: function() {
    // initial state
    return {
      data: [
        {
          author: 'wait',
          text: 'loading',
        },
      ],
    };
  },
  componentDidMount: function() {
    // dom rendered
    this.loadData();
  },
  render: function() {
    return (
      <div>
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  },
});

React.render(<CommentBox />, document.querySelector('.content'));
