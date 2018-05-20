/**
 * @since 2018-05-20 13:59:25
 * @author vivaxy
 */

const STATES = {
  NULL: 0,

};

export default class Element {
  constructor({ index, value, parent, width, transitionInterval }) {
    this.value = value;
    this.index = index;
    this.parent = parent;
    this.width = width;
    this.transitionInterval = transitionInterval;

    this.state = STATES.NULL;
    this.element = document.createElement('div');
    this.element.classList.add('item');
    this.element.style.left = index * width + '%';
    this.element.style.width = width + '%';
    this.element.style.height = value * 50 + '%';
    this.element.style.bottom = '0';
    this.element.style.transition = 'all ' + transitionInterval + 'ms';
    this.element.style.animationDuration = `${transitionInterval}ms`;
    parent.appendChild(this.element);
  }

  copy() {
    return new Element({
      index: this.index,
      value: this.value,
      parent: this.parent,
      width: this.width,
      transitionInterval: this.transitionInterval,
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

  removeMark() {
    this.element.classList.remove('mark');
  }

  addMark() {
    this.element.classList.add('mark');
  }

  addCompare() {
    this.element.classList.add('compare');
  }

  removeCompare() {
    this.element.classList.remove('compare');
  }
}
