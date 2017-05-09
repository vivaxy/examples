/**
 * @since 2017-05-09 12:51:50
 * @author vivaxy
 */

import events from './events';

export default (Component) => {
    const EventfulComponent = class EventfulComponent extends Component {

        on(type, func) {
            if (!this.hasMounted) {
                events.on(type, func);
                console.log(Component.name, 'on', type, func.name, 'listeners', events.listeners(type));
            } else {
                throw new Error('add event listeners before component mounted');
            }
        }

        emit(type, ...args) {
            if (this.hasMounted) {
                events.emit(type, ...args);
                console.log(Component.name, 'emit', type, ...args, 'listeners', events.listeners(type));
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
