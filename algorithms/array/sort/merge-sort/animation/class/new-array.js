/**
 * @since 2018-05-20 15:54:54
 * @author vivaxy
 */

export default class NewArray {
  constructor({ arrayLength, fromIndex, toIndex, parent, arrayName, animationDuration }) {
    this.arrayLength = arrayLength;
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
    this.parent = parent;
    this.arrayName = arrayName;
    this.animationDuration = animationDuration;

    this.element = document.createElement('div');
    this.element.classList.add('new-array');
    this.element.classList.add('new-array-' + arrayName);
    this.element.style.width = (toIndex - fromIndex + 1) * 100 / arrayLength + '%';
    this.element.style.left = fromIndex * 100 / arrayLength + '%';
    this.element.style.transition = `all ${animationDuration}ms`;

    parent.appendChild(this.element);

    setTimeout(() => {
      this.element.classList.add('show');
    }, 0);
  }

  hide() {
    this.element.classList.remove('show');
  }

  dispose() {
    this.parent.removeChild(this.element);
    this.element = null;
  }
}
