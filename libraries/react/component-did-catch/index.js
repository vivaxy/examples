/**
 * @since 2022-08-05 16:14
 * @author vivaxy
 */
function Node() {
  React.useEffect(function () {
    console.log('component mout');
    throw new Error('error when mount');
    return function () {
      console.log('component unmout');
    };
  }, []);
  return React.createElement('div', {}, 'Node');
}

class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('componentDidCatch', error, errorInfo);
    // throw error;
  }

  render() {
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));

try {
  root.render(
    React.createElement(ErrorBoundary, {}, React.createElement(Node)),
  );
} catch (e) {
  console.error('try catch outside render', e);
}
