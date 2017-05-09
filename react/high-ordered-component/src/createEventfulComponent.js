/**
 * @since 2017-05-09 12:51:50
 * @author vivaxy
 */

import events from './events';

export default (Component) => {
    const EventfulComponent = class extends Component {

        on(...args) {
            if (!this.hasMounted) {
                events.on(...args);
            } else {
                throw new Error('add event listeners before component mounted');
            }
        }

        emit(...args) {
            if (this.hasMounted) {
                events.emit(...args);
            } else {
                throw new Error('emit events after component mounted');
            }
        }

        async componentDidMount() {
            await super.componentDidMount();
            this.hasMounted = true;
        }
    };

    EventfulComponent.displayName = Component.name;

    return EventfulComponent;

};
