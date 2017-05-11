/**
 * @since 2017-05-11 14:27:26
 * @author vivaxy
 */

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
