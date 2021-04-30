/**
 * @since 2021-04-29
 * @author vivaxy
 */
function common(name, renderer) {
  let i = 0;

  const $root = document.querySelector(`#${name}`);

  class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        items: ['Original node UPDATED!!!'],
      };
    }

    componentDidMount() {
      $root.querySelector('p').innerHTML = 'Original node';
    }

    handleClick = () => {
      this.setState({
        items: [`New Node ${i++}`, ...this.state.items],
      });
    };

    render() {
      const children = this.state.items.map(renderer);
      return React.createElement('div', null, [
        React.createElement('h2', { key: 'h2' }, name),
        React.createElement(
          'button',
          { onClick: this.handleClick, key: 'button' },
          'Click to add a new child before',
        ),
        React.createElement('div', { key: 'children' }, children),
      ]);
    }
  }

  ReactDOM.render(React.createElement(App), $root);
}

function keyedItem(name) {
  return common(name, function (key) {
    return React.createElement('p', { key }, key);
  });
}

// function fragment(name) {
//   return common(name, function(key) {
//     return React.createElement(React.Fragment, null, React.createElement('p', { key }, key));
//   });
// }

function keyedFragment(name) {
  return common(name, function (key) {
    return React.createElement(
      React.Fragment,
      { key },
      React.createElement('p', null, key),
    );
  });
}

function array(name) {
  return common(name, function (key) {
    return [React.createElement('p', { key }, key)];
  });
}

[keyedItem, keyedFragment, array].forEach(function (func) {
  func(func.name);
});
