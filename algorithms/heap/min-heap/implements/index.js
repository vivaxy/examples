/**
 * @since 20180711 10:47
 * @author vivaxy
 */

module.exports = class MinHeap {

  static getParentIndex(childIndex) {
    return Math.floor((childIndex - 1) / 2);
  }

  static getLeftChildIndex(parentIndex) {
    return parentIndex * 2 + 1;
  }

  static getRightChildIndex(parentIndex) {
    return parentIndex * 2 + 2;
  }

  static hasParent(childIndex) {
    return childIndex > 0;
  }

  static defaultComparator(a) {
    function compare(_a, _b) {
      if (_a === _b) {
        return 0;
      }
      if (_a < _b) {
        return -1;
      }
      return 1;
    }

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

  constructor(comparator) {
    /**
     *  [root, nL, nR, nLL, nLR, nRL, nRR]
     * @type {Array}
     */
    this.heap = [];

    this.comparator = comparator || MinHeap.defaultComparator;
  }

  add(value) {
    this.heap.push(value);
    this.upHeap();

    return this;
  }

  remove(value) {
    const indexes = this.find(value);
    indexes.forEach((index) => {
      this.removeIndex(index);
    });

    return this;
  }

  removeIndex(index) {

    if (index === this.heap.length - 1) {
      this.heap.pop();
    } else {
      this.heap[index] = this.heap.pop();

      if (this.hasLeftChild(index) && MinHeap.hasParent(index) && this.comparator(this.getParent(index)).lessThan(this.heap[index])) {
        this.downHeap(index);
      } else {
        this.upHeap(index);
      }
    }
  }

  find(value) {
    const indexes = [];
    this.heap.forEach((v, index) => {
      if (v === value) {
        indexes.push(index);
      }
    });
    return indexes;
  }

  getParent(childIndex) {
    return this.heap[MinHeap.getParentIndex(childIndex)];
  }

  hasLeftChild(parentIndex) {
    return MinHeap.getLeftChildIndex(parentIndex) < this.heap.length;
  }

  hasRightChild(parentIndex) {
    return MinHeap.getRightChildIndex(parentIndex) < this.heap.length;
  }

  getLeftChild(parentIndex) {
    return this.heap[MinHeap.getLeftChildIndex(parentIndex)];
  }

  getRightChild(parentIndex) {
    return this.heap[MinHeap.getRightChildIndex(parentIndex)];
  }

  upHeap(fromIndex) {
    let index = fromIndex || this.heap.length - 1;

    while (MinHeap.hasParent(index) && this.comparator(this.getParent(index)).greaterThan(this.heap[index])) {
      const parentIndex = MinHeap.getParentIndex(index);
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  downHeap(fromIndex) {
    let index = fromIndex || 0;
    let nextIndex = null;

    while (this.hasLeftChild(index)) {
      if (this.hasRightChild(index) && this.comparator(this.getRightChild(index)).lessThan(this.getLeftChild(index))) {
        nextIndex = MinHeap.getRightChildIndex(index);
      } else {
        nextIndex = MinHeap.getLeftChildIndex(index);
      }

      if (this.heap[index] <= this.heap[nextIndex]) {
        break;
      }

      this.swap(index, nextIndex);
      index = nextIndex;
    }
  }

  swap(fromIndex, toIndex) {
    const temp = this.heap[fromIndex];
    this.heap[fromIndex] = this.heap[toIndex];
    this.heap[toIndex] = temp;
  }

  toString() {
    return this.heap.toString();
  }

};
