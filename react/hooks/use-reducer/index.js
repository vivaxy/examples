/**
 * @since 2019-07-28 21:27:02
 * @author vivaxy
 * @see https://testdriven.io/blog/react-hooks-advanced/
 */
window.renderCount = 0;
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

const ReducerContext = React.createContext();

function Counter() {
  const { state, dispatch } = React.useContext(ReducerContext);
  return React.createElement(React.Fragment, {}, [
    `Count: ${state.count}`,
    React.createElement(
      'button',
      {
        onClick() {
          dispatch({ type: 'increment' });
        },
      },
      ['+'],
    ),
    React.createElement(
      'button',
      {
        onClick() {
          dispatch({ type: 'decrement' });
        },
      },
      ['-'],
    ),
  ]);
}

function Provider(props) {
  const [state, dispatch] = React.useReducer(props.reducer, props.initialState);
  return React.createElement(
    ReducerContext.Provider,
    {
      value: {
        state,
        dispatch,
      },
    },
    [props.children],
  );
}

function RenderCount() {
  window.renderCount++;
  return `render count: ${window.renderCount}`;
}

function App() {
  return React.createElement(
    Provider,
    {
      reducer,
      initialState,
    },
    [
      React.createElement(Counter),
      React.createElement('br'),
      React.createElement(RenderCount),
    ],
  );
}

ReactDOM.render(React.createElement(App), document.querySelector('#root'));
