/**
 * @since 2017-04-18 10:55:41
 * @author vivaxy
 */

import { observable, action } from 'mobx';

export default class AppState {

    @observable timer = 0;

    constructor() {
        setInterval(() => {
            this.addTime();
        }, 1000);
    }

    @action resetTimer() {
        this.timer = 0;
    }

    @action addTime() {
        this.timer = this.timer + 1;
    }

}
