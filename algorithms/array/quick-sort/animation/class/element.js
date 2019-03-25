/**
 * @since 2018-05-26 10:55:58
 * @author vivaxy
 */

import BaseElement from '../../../../_animation/class/element.js';

const MARK_CLASSNAMES = {
  ArrayMark: 'array-mark',
  PivotMark: 'pivot-mark',
  LoopMark: 'loop-mark',
  CompareMark: 'compare-mark',
};

export default class Element extends BaseElement {
  constructor(args) {
    super(args);
    this._createElement();
    this._appendElement();

    Object.keys(MARK_CLASSNAMES).forEach((name) => {
      this['add' + name] = () => {
        this.element.classList.add(MARK_CLASSNAMES[name]);
      };
      this['remove' + name] = () => {
        this.element.classList.remove(MARK_CLASSNAMES[name]);
      };
      this['has' + name] = () => {
        return this.element.classList.contains(MARK_CLASSNAMES[name]);
      };
    });
  }

  setIndex(index) {
    this.index = index;
    this.element.style.left = this.index * this.width + '%';
  }

}
