/**
 * @since 15-09-03 09:37
 * @author vivaxy
 */
'use strict';
class BrowserTracker {
    constructor() {
        this.remote = '/browser-tracker-server';
    }

    push(o) {
        navigator.sendBeacon(this.remote, JSON.stringify(o));
        return this;
    }
}
window._browserTracker = window._browserTracker || [];
if (!(window._browserTracker instanceof BrowserTracker)) {
    let browserTrackerRecord = window._browserTracker;
    window._browserTracker = new BrowserTracker();
    browserTrackerRecord.forEach(data => {
        window._browserTracker.push(data);
    });
}
