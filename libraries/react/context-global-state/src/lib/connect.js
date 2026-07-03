import PropTypes from 'prop-types';

export default (Component) => {
  const Connect = class Connect extends Component {
    static contextTypes = {
      initialize: PropTypes.func,
      store: PropTypes.object,
      actions: PropTypes.object,
    };
  };

  Connect.displayName = Component.name;

  return Connect;
};
