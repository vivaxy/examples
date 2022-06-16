/**
 * @since 2022-06-16 19:40
 * @author vivaxy
 */
document.querySelectorAll('button[data-event-in]').forEach(function (button) {
  const { eventIn, eventOut } = button.dataset;
  button.addEventListener(eventIn, function (e) {
    e.target.style.background = 'red';
  });
  button.addEventListener(eventOut, function (e) {
    e.target.style.background = 'transparent';
  });
});

document.body.addEventListener('click', function (e) {
  if (e.target.classList.contains('button')) {
    alert('clicked');
  }
});

/**
 * @see https://github.com/ant-design/ant-design/issues/14424
 */
ReactDOM.render(
  React.createElement(
    antd.Tooltip,
    {
      title: 'Tooltip',
    },
    React.createElement(
      'div',
      {
        className: 'button',
      },
      'Antd Tooltip',
    ),
  ),
  document.getElementById('antd-tooltip'),
);

ReactDOM.render(
  React.createElement(
    'div',
    {
      className: 'button',
    },
    'React',
  ),
  document.getElementById('react'),
);
