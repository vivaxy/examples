/**
 * @since 2019-07-29 12:38
 * @author vivaxy
 */
import { ReducerContext } from '../lib/redux.js';

const { React } = window;

export default function Counter() {
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
