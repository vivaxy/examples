/**
 * @since 2016-08-24 17:40
 * @author vivaxy
 */

export default (initialState, handlers) => {
  return (state = initialState, action) => {
    return handlers[action.type] ? handlers[action.type](state, action) : state;
  };
};
