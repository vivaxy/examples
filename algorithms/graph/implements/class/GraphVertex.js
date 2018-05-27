/**
 * @since 20180527 17:19
 * @author vivaxy
 * @see https://github.com/trekhleb/javascript-algorithms/blob/master/src/data-structures/graph/GraphVertex.js
 */

module.exports = class GraphVertex {
  constructor({ value }) {
    if (value === undefined) {
      throw new Error('Graph vertex must have a value');
    }

    this.value = value;
    this.edges = {};
  }

  addEdge(edge) {
    this.edges[edge.getKey()] = edge;
  }

  deleteEdge(edge) {
    Reflect.deleteProperty(this.edges, edge.getKey());
  }

  getKey() {
    return this.value;
  }

  getEdges() {
    return Object.values(this.edges);
  }

  getNeighbors() {
    return Object.values(this.edges).map(findNeighbor);

    function findNeighbor(edge) {
      return edge.startVertex === this ? edge.endVertex : edge.startVertex;
    }
  }

};
