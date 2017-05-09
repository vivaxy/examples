/**
 * @since 2017-05-09 12:51:50
 * @author vivaxy
 */

import events from './events';

const logEvents = (sourceName, method, type, data) => {
    console.log(sourceName, method, type, data, events._events);
};

export default (Component) => {
    const EventfulComponent = class EventfulComponent extends Component {

        setState(state) {
            console.log(Component.name, this.state, state);
            super.setState(state);
        }

        on(componentName, type, func) {
            const composedType = componentName + ':' + type;
            if (!this.hasMounted) {
                events.on(composedType, func);
                logEvents(Component.name, 'on', composedType, func);
            } else {
                throw new Error('add event listeners before component mounted');
            }
        }

        emit(type, data) {
            const composedType = Component.name + ':' + type;
            if (this.hasMounted) {
                events.emit(composedType, data);
                logEvents(Component.name, 'emit', type, data);
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
