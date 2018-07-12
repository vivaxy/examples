/**
 * @since 20180711 20:03
 * @author vivaxy
 */

module.exports = function floydWarshall(graph) {

  const vertices = graph.getAllVertices();

  const distances = [];
  const previousVertices = [];

  for (let k = 0; k <= vertices.length; k++) {
    vertices.forEach((vertex, i) => {

      if (k === 0) {
        distances[i] = [];
        previousVertices[i] = [];
      }

      vertices.forEach((endVertex, j) => {

        if (k === 0) {
          distances[i][j] = [];
          previousVertices[i][j] = [];

          if (vertex === endVertex) {
            distances[i][j][k] = 0;
            previousVertices[i][j][k] = null;
          } else {
            const edge = graph.findEdge(vertex, endVertex);
            if (edge) {
              distances[i][j][k] = edge.weight;
              previousVertices[i][j][k] = vertex;
            } else {
              distances[i][j][k] = Infinity;
              previousVertices[i][j][k] = null;
            }
          }
        } else {
          if (distances[i][j][k - 1] > distances[i][k - 1][k - 1] + distances[k - 1][j][k - 1]) {
            distances[i][j][k] = distances[i][k - 1][k - 1] + distances[k - 1][j][k - 1];
            previousVertices[i][j][k] = previousVertices[k - 1][j][k - 1];
          } else {
            distances[i][j][k] = distances[i][j][k - 1];
            previousVertices[i][j][k] = previousVertices[i][j][k - 1];
          }
        }

      });

    });
  }

  return { distances, previousVertices };

};
