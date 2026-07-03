export default (initialState, handlers) => {
  return (state = initialState, action) => {
    return handlers[action.type] ? handlers[action.type](state, action) : state;
  };
};
