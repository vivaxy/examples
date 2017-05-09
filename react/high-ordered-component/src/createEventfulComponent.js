/**
 * @since 2017-05-09 12:51:50
 * @author vivaxy
 */

import events from './events';

export default (Component) => {
    const EventfulComponent = class extends Component {

        on(type, callback) {
            if (!this.hasMounted) {
                events.on(type, callback);
            } else {
                throw new Error('add event listeners before component mounted');
            }
        }

        emit(type, ...args) {
            if (this.hasMounted) {
                events.emit(type, ...args);
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
