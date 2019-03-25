/**
 * @since 2018-05-26 09:57:46
 * @author vivaxy
 */

import BaseElement from '../../../../_animation/class/element.js';

export default class Element extends BaseElement {
  constructor(args) {
    super(args);
    this._createElement();
    this.element.style.height = this.value * 50 + '%';
    this._appendElement();
  }

  copy() {
    return new Element({
      index: this.index,
      value: this.value,
      parent: this.parent,
      width: this.width,
      animationDuration: this.animationDuration,
    });
  }

  moveToNewArray(data, cb) {
    setTimeout(() => {
      this.element.style.bottom = '50%';
      cb();
    }, 0);
  }

  moveBack(data, cb) {
    this.removeMark();
    setTimeout(() => {
      this.element.style.left = data.index * this.width + '%';
      this.element.style.bottom = '0';
      cb();
    }, 0);
  }

}
