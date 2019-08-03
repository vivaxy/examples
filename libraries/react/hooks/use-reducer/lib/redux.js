/**
 * @since 2019-07-29 12:36
 * @author vivaxy
 */
const { React } = window;

export const ReducerContext = React.createContext();

export function Provider(props) {
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
