/**
 * @since 2019-07-29 12:37
 * @author vivaxy
 */
const { React } = window;
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error('Unexpected action.type: ' + action.type);
  }
}

import { Provider } from './lib/redux.js';
import Counter from './components/Counter.js';
import RenderCount from './components/RenderCount.js';

export default function App() {
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
