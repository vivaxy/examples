/**
 * @since 20180711 20:03
 * @author vivaxy
 */

module.exports = function floydWarshall(graph) {

  const vertices = graph.getAllVertices();

  const weightMatrix = [];
  vertices.forEach((vertex) => {
    const weightMatrixRow = [];

    vertices.forEach((endVertex) => {

      if (vertex === endVertex) {
        weightMatrixRow.push(0);
      } else {
        const edge = graph.findEdge(vertex, endVertex);
        if (edge) {
          weightMatrixRow.push(edge.weight);
        } else {
          weightMatrixRow.push(Infinity);
        }
      }

    });

    weightMatrix.push(weightMatrixRow);
  });

  const distances = [];
  const previous = [];


};
