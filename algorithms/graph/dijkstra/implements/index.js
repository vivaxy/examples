/**
 * @since 2018-07-08 15:58:13
 * @author vivaxy
 */

const PriorityQueue = require('../../../priority-queue/implements/index.js');

module.exports = function dijkstra(graph, startVertex) {

  const distances = {};
  const visitedVertices = {};
  const previousVertices = {};
  const queue = new PriorityQueue();


  graph.getAllVertices().forEach((vertex) => {
    distances[vertex.getKey()] = Infinity;
    previousVertices[vertex.getKey()] = null;
  });
  distances[startVertex.getKey()] = 0;


  queue.add(startVertex, distances[startVertex.getKey()]);

  while (!queue.isEmpty()) {
    const currentVertex = queue.poll();

    currentVertex.getNeighbors().forEach((neighborVertex) => {

      if (!visitedVertices[neighborVertex.getKey()]) {

        const edge = graph.findEdge(currentVertex, neighborVertex);

        const existingDistanceToNeighbor = distances[neighborVertex.getKey()];
        const distanceToNeighborFromCurrent = distances[currentVertex.getKey()] + edge.weight;

        if (distanceToNeighborFromCurrent < existingDistanceToNeighbor) {
          distances[neighborVertex.getKey()] = distanceToNeighborFromCurrent;

          if (queue.hasValue(neighborVertex)) {
            queue.changePriority(neighborVertex, distanceToNeighborFromCurrent);
          }

          previousVertices[neighborVertex.getKey()] = currentVertex;
        }

        if (!queue.hasValue(neighborVertex)) {
          queue.add(neighborVertex, distances[neighborVertex.getKey()]);
        }

      }
    });

    visitedVertices[currentVertex.getKey()] = currentVertex;
  }

  return {
    distances,
    previousVertices,
  };

};
