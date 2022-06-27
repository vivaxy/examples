/**
 * @since 2022-06-27 18:50
 * @author vivaxy
 */
const Target = function () {
  return React.createElement('div', {
    className: 'target',
    onMouseEnter(e) {
      console.log('target mouseenter', e.type, e.nativeEvent.type);
    },
  });
};

const Mask = function () {
  return React.createElement('div', {
    className: 'mask',
    onMouseEnter(e) {
      console.log('mask mouseenter', e.type, e.nativeEvent.type);
    },
  });
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  React.createElement(React.Fragment, null, [
    React.createElement(Target, { key: 'target' }),
    React.createElement(Mask, { key: 'mask' }),
  ]),
);
