/**
 * @since 20180527 17:10
 * @author vivaxy
 */

const test = require('ava');
const Graph = require('../../../../implements/class/Graph.js');
const GraphEdge = require('../../../../implements/class/GraphEdge.js');
const GraphVertex = require('../../../../implements/class/GraphVertex.js');
const { topologicalSort } = require('../index.js');

test('topological sort', (t) => {
  const vertex1 = new GraphVertex({ value: 'undershorts' });
  const vertex2 = new GraphVertex({ value: 'socks' });
  const vertex3 = new GraphVertex({ value: 'compression shorts' });
  const vertex4 = new GraphVertex({ value: 'hose' });
  const vertex5 = new GraphVertex({ value: 'cup' });
  const vertex6 = new GraphVertex({ value: 'pants' });
  const vertex7 = new GraphVertex({ value: 'skates' });
  const vertex8 = new GraphVertex({ value: 'leg pads' });
  const vertex9 = new GraphVertex({ value: 'T-shirt' });
  const vertex10 = new GraphVertex({ value: 'chest pad' });
  const vertex11 = new GraphVertex({ value: 'sweater' });
  const vertex12 = new GraphVertex({ value: 'mask' });
  const vertex13 = new GraphVertex({ value: 'catch glove' });
  const vertex14 = new GraphVertex({ value: 'blocker' });

  const edge1 = new GraphEdge({ startVertex: vertex1, endVertex: vertex3 });
  const edge2 = new GraphEdge({ startVertex: vertex2, endVertex: vertex4 });
  const edge3 = new GraphEdge({ startVertex: vertex3, endVertex: vertex4 });
  const edge4 = new GraphEdge({ startVertex: vertex3, endVertex: vertex5 });
  const edge5 = new GraphEdge({ startVertex: vertex4, endVertex: vertex6 });
  const edge6 = new GraphEdge({ startVertex: vertex5, endVertex: vertex6 });
  const edge7 = new GraphEdge({ startVertex: vertex6, endVertex: vertex7 });
  const edge8 = new GraphEdge({ startVertex: vertex7, endVertex: vertex8 });
  const edge9 = new GraphEdge({ startVertex: vertex6, endVertex: vertex11 });
  const edge10 = new GraphEdge({ startVertex: vertex8, endVertex: vertex13 });
  const edge11 = new GraphEdge({ startVertex: vertex9, endVertex: vertex10 });
  const edge12 = new GraphEdge({ startVertex: vertex10, endVertex: vertex11 });
  const edge13 = new GraphEdge({ startVertex: vertex11, endVertex: vertex12 });
  const edge14 = new GraphEdge({ startVertex: vertex12, endVertex: vertex13 });
  const edge15 = new GraphEdge({ startVertex: vertex13, endVertex: vertex14 });

  const graph = new Graph({ isDirected: true });
  graph.addEdge(edge1).addEdge(edge2).addEdge(edge3).addEdge(edge4).addEdge(edge5)
    .addEdge(edge6).addEdge(edge7).addEdge(edge8).addEdge(edge9).addEdge(edge10)
    .addEdge(edge11).addEdge(edge12).addEdge(edge13).addEdge(edge14).addEdge(edge15);

  t.deepEqual(topologicalSort(graph), [
    'undershorts', 'socks', 'T-shirt', 'compression shorts', 'chest pad', 'hose',
    'cup', 'pants', 'skates', 'sweater', 'leg pads', 'mask', 'catch glove', 'blocker',
  ]);
});
