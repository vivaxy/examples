/**
 * @since 20180527 17:10
 * @author vivaxy
 */

/**
 * n edges
 * m vertexes
 * @param graph
 * @returns {Array}
 */
exports.topologicalSort = function topologicalSort(graph) { // Θ(m * n + 6 * n + 2 * m)
  const vertices = graph.getAllVertices(); // Θ(n)
  const edges = graph.getAllEdges(); // Θ(m)
  const inDegree = vertices.map(mapZero); // Θ(n)
  const next = [];
  const sequence = [];

  // for (let i = 0; i < vertices.length; i++) { // Θ(2 * n * m + n * n)
  //   const edges = vertices[i].getEdges(); // Θ(m)
  //   for (let j = 0; j < edges.length; j++) { // Θ(m + n)
  //     inDegree[vertices.indexOf(edges[j].endVertex)]++; // Θ(n)
  //   }
  // }
  for (let i = 0; i < edges.length; i++) { // Θ(m * n)
    inDegree[vertices.indexOf(edges[i].endVertex)]++; // Θ(n)
  }

  for (let i = 0; i < inDegree.length; i++) { // Θ(n)
    if (inDegree[i] === 0) {
      next.push(vertices[i].value);
    }
  }

  while (next.length) { // Θ(2 * n + m)
    const value = next.shift();
    sequence.push(value);
    const vertex = vertices.find(findVertexByValue(value)); // Θ(n)
    const currentEdges = vertex.getEdges();
    for (let i = 0; i < currentEdges.length; i++) {
      if (currentEdges[i].startVertex === vertex) {
        const index = vertices.indexOf(currentEdges[i].endVertex); // Θ(n)
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
    };
  }
};
