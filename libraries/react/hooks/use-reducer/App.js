/**
 * @since 2019-07-29 12:37
 * @author vivaxy
 */
import { Provider } from './lib/redux.js';
import Counter from './components/Counter.js';
import RenderCount from './components/RenderCount.js';
import { reducer, initialState } from './reducer.js';

const { React } = window;

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
