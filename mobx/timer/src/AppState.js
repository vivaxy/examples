/**
 * @since 2017-04-18 10:55:41
 * @author vivaxy
 */

import { observable } from 'mobx';

export default class AppState {

    @observable timer = 0;

    constructor() {
        setInterval(() => {
            this.timer = this.timer + 1;
        }, 1000);
    }

    resetTimer() {
        this.timer = 0;
    }

}
