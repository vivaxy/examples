/**
 * @since 20180711 19:24
 * @author vivaxy
 */

module.exports = function bellmanFord(graph, startVertex) {

  const distances = {};
  const previousVertices = {};

  const allVertices = graph.getAllVertices();
  allVertices.forEach((vertex) => {
    previousVertices[vertex.getKey()] = null;
    distances[vertex.getKey()] = Infinity;
  });
  distances[startVertex.getKey()] = 0;

  for (let i = 0; i < allVertices.length - 1; i++) {

    Object.keys(distances).forEach((vertexKey) => {

      const vertex = graph.getVertexByKey(vertexKey);

      vertex.getNeighbors().forEach((neighborVertex) => {

        const edge = graph.findEdge(vertex, neighborVertex);

        const distanceToVertex = distances[vertex.getKey()];
        const distanceToNeighborVertex = distanceToVertex + edge.weight;

        if (distanceToNeighborVertex < distances[neighborVertex.getKey()]) {
          distances[neighborVertex.getKey()] = distanceToNeighborVertex;
          previousVertices[neighborVertex.getKey()] = vertex;
        }

      });

    });

  }

  return {
    distances,
    previousVertices,
  };

};
