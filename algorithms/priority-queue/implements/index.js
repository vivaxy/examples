/**
 * @since 20180711 15:24
 * @author vivaxy
 */

const MinHeap = require('../../heap/min-heap/implements/index.js');

module.exports = class PriorityQueue extends MinHeap {
  constructor() {
    const comparator = (a) => {
      const compare = (_a, _b) => {
        if (this.priorities[_a] === this.priorities[_b]) {
          return 0;
        }
        if (this.priorities[_a] < this.priorities[_b]) {
          return -1;
        }
        return 1;
      };

      return {
        greaterThan(b) {
          return compare(a, b) > 0;
        },
        lessThan(b) {
          return compare(a, b) < 0;
        },
        equals(b) {
          return compare(a, b) === 0;
        },
      };
    };

    super(comparator);
    this.priorities = {};
  }

  /**
   * O(lgn)
   * @param value
   * @param priority
   * @returns {module.PriorityQueue}
   */
  add(value, priority = 0) {
    this.priorities[value] = priority;

    super.add(value);

    return this;
  }

  remove(value) {
    super.remove(value);

    delete this.priorities[value];

    return this;
  }

  changePriority(value, priority) {
    this.remove(value);
    this.add(value, priority);
  }

};
