/**
 * @since 2017-05-11 14:20:23
 * @author vivaxy
 */

import PropTypes from 'prop-types';

const createActionObject = function(obj, actionCreator) {
  const result = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (typeof value === 'function') {
      result[key] = actionCreator(value);
    } else if (typeof value === 'object') {
      result[key] = createActionObject(obj[key], actionCreator);
    } else {
      throw new Error('only Function and Object are accepted');
    }
  });
  return result;
};

export default (Component) => {
  const Provider = class Provider extends Component {
    static childContextTypes = {
      initialize: PropTypes.func,
      store: PropTypes.object,
      actions: PropTypes.object,
    };

    store = {};
    actions = {};
    state = {};

    constructor(props, context) {
      super(props, context);
      this.actionCreator = this.actionCreator.bind(this);
      this.initializeStoreAndActions = this.initializeStoreAndActions.bind(
        this,
      );
    }

    getChildContext() {
      return {
        initialize: this.initializeStoreAndActions,
        store: this.store,
        actions: this.actions,
      };
    }

    initializeStoreAndActions(storeUpdater, actionsUpdater) {
      Object.assign(
        this.actions,
        createActionObject(actionsUpdater(this.actions), this.actionCreator),
      );
      Object.assign(this.store, storeUpdater(this.store));
    }

    actionCreator(func) {
      if (func._created) {
        return func;
      }
      const action = (...args) => {
        return func(...args)((newStore) => {
          Object.assign(this.store, newStore);
          this.setState({});
        }, this.store);
      };
      action._created = true;
      return action;
    }
  };

  Provider.displayName = Component.name;

  return Provider;
};
