/**
 * @since 20180527 17:10
 * @author vivaxy
 */

const test = require('ava');
const Graph = require('../../../implements/class/Graph.js');
const GraphEdge = require('../../../implements/class/GraphEdge.js');
const GraphVertex = require('../../../implements/class/GraphVertex.js');
const { topologicalSort } = require('../index.js');

test('topological sort', (t) => {
  const vertex1 = new GraphVertex('undershorts');
  const vertex2 = new GraphVertex('socks');
  const vertex3 = new GraphVertex('compression shorts');
  const vertex4 = new GraphVertex('hose');
  const vertex5 = new GraphVertex('cup');
  const vertex6 = new GraphVertex('pants');
  const vertex7 = new GraphVertex('skates');
  const vertex8 = new GraphVertex('leg pads');
  const vertex9 = new GraphVertex('T-shirt');
  const vertex10 = new GraphVertex('chest pad');
  const vertex11 = new GraphVertex('sweater');
  const vertex12 = new GraphVertex('mask');
  const vertex13 = new GraphVertex('catch glove');
  const vertex14 = new GraphVertex('blocker');

  const edge1 = new GraphEdge(vertex1, vertex3);
  const edge2 = new GraphEdge(vertex2, vertex4);
  const edge3 = new GraphEdge(vertex3, vertex4);
  const edge4 = new GraphEdge(vertex3, vertex5);
  const edge5 = new GraphEdge(vertex4, vertex6);
  const edge6 = new GraphEdge(vertex5, vertex6);
  const edge7 = new GraphEdge(vertex6, vertex7);
  const edge8 = new GraphEdge(vertex7, vertex8);
  const edge9 = new GraphEdge(vertex6, vertex11);
  const edge10 = new GraphEdge(vertex8, vertex13);
  const edge11 = new GraphEdge(vertex9, vertex10);
  const edge12 = new GraphEdge(vertex10, vertex11);
  const edge13 = new GraphEdge(vertex11, vertex12);
  const edge14 = new GraphEdge(vertex12, vertex13);
  const edge15 = new GraphEdge(vertex13, vertex14);

  const graph = new Graph(false);
  graph
    .addEdge(edge1)
    .addEdge(edge2)
    .addEdge(edge3)
    .addEdge(edge4)
    .addEdge(edge5)
    .addEdge(edge6)
    .addEdge(edge7)
    .addEdge(edge8)
    .addEdge(edge9)
    .addEdge(edge10)
    .addEdge(edge11)
    .addEdge(edge12)
    .addEdge(edge13)
    .addEdge(edge14)
    .addEdge(edge15);

  t.deepEqual(topologicalSort(graph), [
    'undershorts', 'socks', 'T-shirt', 'compression shorts', 'chest pad', 'hose',
    'cup', 'pants', 'skates', 'sweater', 'leg pads', 'mask', 'catch glove', 'blocker',
  ]);
});
