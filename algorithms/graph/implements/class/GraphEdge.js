/**
 * @since 20180527 17:17
 * @author vivaxy
 * @see https://github.com/trekhleb/javascript-algorithms/blob/master/src/data-structures/graph/GraphEdge.js
 */

module.exports = class GraphEdge {
  constructor({ startVertex, endVertex }) {

    if (startVertex === endVertex) {
      throw new Error('startVertex cannot be same to endVertex');
    }

    this.startVertex = startVertex;
    this.endVertex = endVertex;
  }

  getKey() {
    const startVertexKey = this.startVertex.getKey();
    const endVertexKey = this.endVertex.getKey();

    return `${startVertexKey}_${endVertexKey}`;
  }

};
