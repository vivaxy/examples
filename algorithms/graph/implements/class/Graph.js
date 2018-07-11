/**
 * @since 20180527 17:17
 * @author vivaxy
 * @see https://github.com/trekhleb/javascript-algorithms/blob/master/src/data-structures/graph/Graph.js
 */

module.exports = class Graph {
  constructor(isDirected = true) {
    // 顶点
    this.vertices = {};

    // 边
    this.edges = {};

    // 是否有向
    this.isDirected = isDirected;
  }

  addVertex(newVertex) {
    this.vertices[newVertex.getKey()] = newVertex;

    return this;
  }

  getVertexByKey(vertexKey) {
    return this.vertices[vertexKey];
  }

  getAllVertices() {
    return Object.values(this.vertices);
  }

  addEdge(edge) {
    let startVertex = this.getVertexByKey(edge.startVertex.getKey());
    let endVertex = this.getVertexByKey(edge.endVertex.getKey());

    if (!startVertex) {
      this.addVertex(edge.startVertex);
      startVertex = edge.startVertex;
    }

    if (!endVertex) {
      this.addVertex(edge.endVertex);
      endVertex = edge.endVertex;
    }

    if (this.edges[edge.getKey()]) {
      throw new Error('Edge has already been added before');
    } else {
      this.edges[edge.getKey()] = edge;
    }

    // Add edge to the vertices.
    if (this.isDirected) {
      // If graph IS directed then add the edge only to start vertex.
      startVertex.addEdge(edge);
    } else {
      // If graph ISN'T directed then add the edge to both vertices.
      startVertex.addEdge(edge);
      endVertex.addEdge(edge);
    }

    return this;
  }

  getAllEdges() {
    return Object.values(this.edges);
  }

  findEdge(startVertex, endVertex) {
    const vertex = this.getVertexByKey(startVertex.getKey());

    if (!vertex) {
      return null;
    }

    return vertex.findEdge(endVertex);
  }

};
