/**
 * @since 20180527 17:10
 * @author vivaxy
 */

exports.topologicalSort = function topologicalSort(graph) {
  const vertices = graph.getAllVertices();
  const edges = graph.getAllEdges();
  const inDegree = vertices.map(mapZero);
  const next = [];
  const sequence = [];

  for (let i = 0; i < edges.length; i++) {
    inDegree[vertices.indexOf(edges[i].endVertex)]++;
  }

  for (let i = 0; i < inDegree.length; i++) {
    if (inDegree[i] === 0) {
      next.push(vertices[i].value);
    }
  }

  while (next.length) {
    const value = next.shift();
    sequence.push(value);
    const vertex = vertices.find(findVertexByValue(value));
    const currentEdges = vertex.getEdges();
    for (let i = 0; i < currentEdges.length; i++) {
      if (currentEdges[i].startVertex === vertex) {
        const index = vertices.indexOf(currentEdges[i].endVertex);
        inDegree[index]--;
        if (inDegree[index] === 0) {
          next.push(currentEdges[i].endVertex.value);
        }
      }
    }

  }

  return sequence;

  function mapZero() {
    return 0;
  }

  function findVertexByValue(value) {
    return function findVertex(vertex) {
      return vertex.value === value;
    }
  }
};
