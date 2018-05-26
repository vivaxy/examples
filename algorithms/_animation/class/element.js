/**
 * @since 2018-05-20 13:59:25
 * @author vivaxy
 */

export default class Element {
  constructor({ index, value, parent, width, animationDuration }) {
    this.value = value;
    this.index = index;
    this.parent = parent;
    this.width = width;
    this.animationDuration = animationDuration;
  }

  _createElement() {
    this.element = document.createElement('div');
    this.element.classList.add('item');
    this.element.style.left = this.index * this.width + '%';
    this.element.style.width = this.width + '%';
    this.element.style.height = this.value * 100 + '%';
    this.element.style.bottom = '0';
    this.element.style.transition = 'all ' + this.animationDuration + 'ms';
    this.element.style.animationDuration = `${this.animationDuration}ms`;
  }

  _appendElement() {
    this.parent.appendChild(this.element);
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
