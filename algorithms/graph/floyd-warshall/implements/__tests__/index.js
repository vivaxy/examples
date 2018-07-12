/**
 * @since 20180711 19:24
 * @author vivaxy
 */

const test = require('ava');
const floydWarshall = require('../index.js');
const Graph = require('../../../implements/class/Graph.js');
const GraphEdge = require('../../../implements/class/GraphEdge.js');
const GraphVertex = require('../../../implements/class/GraphVertex.js');

test('weight matrix', (t) => {

  const vertex1 = new GraphVertex(1);
  const vertex2 = new GraphVertex(2);
  const vertex3 = new GraphVertex(3);
  const vertex4 = new GraphVertex(4);

  const edge13 = new GraphEdge(vertex1, vertex3, -2);
  const edge21 = new GraphEdge(vertex2, vertex1, 4);
  const edge23 = new GraphEdge(vertex2, vertex3, 3);
  const edge34 = new GraphEdge(vertex3, vertex4, 2);
  const edge42 = new GraphEdge(vertex4, vertex2, -1);

  const graph = new Graph(true);
  graph
    .addEdge(edge13)
    .addEdge(edge21)
    .addEdge(edge23)
    .addEdge(edge34)
    .addEdge(edge42);

  const { distances, previousVertices } = floydWarshall(graph);

  const vertices = graph.getAllVertices();
  t.is(distances[vertices.indexOf(vertex1)][vertices.indexOf(vertex4)][vertices.length], 0);
  t.is(previousVertices[vertices.indexOf(vertex1)][vertices.indexOf(vertex4)][vertices.length], vertex3);

});

test('find minimum paths to all vertices for undirected graph', (t) => {

  const vertexA = new GraphVertex('A');
  const vertexB = new GraphVertex('B');
  const vertexC = new GraphVertex('C');
  const vertexD = new GraphVertex('D');
  const vertexE = new GraphVertex('E');
  const vertexF = new GraphVertex('F');
  const vertexG = new GraphVertex('G');
  const vertexH = new GraphVertex('H');

  const edgeAB = new GraphEdge(vertexA, vertexB, 4);
  const edgeAE = new GraphEdge(vertexA, vertexE, 7);
  const edgeAC = new GraphEdge(vertexA, vertexC, 3);
  const edgeBC = new GraphEdge(vertexB, vertexC, 6);
  const edgeBD = new GraphEdge(vertexB, vertexD, 5);
  const edgeEC = new GraphEdge(vertexE, vertexC, 8);
  const edgeED = new GraphEdge(vertexE, vertexD, 2);
  const edgeDC = new GraphEdge(vertexD, vertexC, 11);
  const edgeDG = new GraphEdge(vertexD, vertexG, 10);
  const edgeDF = new GraphEdge(vertexD, vertexF, 2);
  const edgeFG = new GraphEdge(vertexF, vertexG, 3);
  const edgeEG = new GraphEdge(vertexE, vertexG, 5);

  const graph = new Graph();
  graph
    .addVertex(vertexH)
    .addEdge(edgeAB)
    .addEdge(edgeAE)
    .addEdge(edgeAC)
    .addEdge(edgeBC)
    .addEdge(edgeBD)
    .addEdge(edgeEC)
    .addEdge(edgeED)
    .addEdge(edgeDC)
    .addEdge(edgeDG)
    .addEdge(edgeDF)
    .addEdge(edgeFG)
    .addEdge(edgeEG);

  const { distances, previousVertices } = floydWarshall(graph);

  const vertices = graph.getAllVertices();
  t.is(distances[vertices.indexOf(vertexA)][vertices.indexOf(vertexH)][vertices.length], Infinity);
  t.is(distances[vertices.indexOf(vertexA)][vertices.indexOf(vertexA)][vertices.length], 0);
  t.is(distances[vertices.indexOf(vertexA)][vertices.indexOf(vertexB)][vertices.length], 4);
  t.is(distances[vertices.indexOf(vertexA)][vertices.indexOf(vertexE)][vertices.length], 7);
  t.is(distances[vertices.indexOf(vertexA)][vertices.indexOf(vertexC)][vertices.length], 3);
  t.is(distances[vertices.indexOf(vertexA)][vertices.indexOf(vertexD)][vertices.length], 9);
  t.is(distances[vertices.indexOf(vertexA)][vertices.indexOf(vertexG)][vertices.length], 12);
  t.is(distances[vertices.indexOf(vertexA)][vertices.indexOf(vertexF)][vertices.length], 11);

  t.is(previousVertices[vertices.indexOf(vertexA)][vertices.indexOf(vertexF)][vertices.length], vertexD);
  t.is(previousVertices[vertices.indexOf(vertexA)][vertices.indexOf(vertexD)][vertices.length], vertexB);
  t.is(previousVertices[vertices.indexOf(vertexA)][vertices.indexOf(vertexB)][vertices.length], vertexA);
  t.is(previousVertices[vertices.indexOf(vertexA)][vertices.indexOf(vertexG)][vertices.length], vertexE);
  t.is(previousVertices[vertices.indexOf(vertexA)][vertices.indexOf(vertexC)][vertices.length], vertexA);
  t.is(previousVertices[vertices.indexOf(vertexA)][vertices.indexOf(vertexA)][vertices.length], null);
  t.is(previousVertices[vertices.indexOf(vertexA)][vertices.indexOf(vertexH)][vertices.length], null);

});


test('find minimum paths to all vertices for directed graph with negative edge weights', (t) => {

  const vertexS = new GraphVertex('S');
  const vertexE = new GraphVertex('E');
  const vertexA = new GraphVertex('A');
  const vertexD = new GraphVertex('D');
  const vertexB = new GraphVertex('B');
  const vertexC = new GraphVertex('C');
  const vertexH = new GraphVertex('H');

  const edgeSE = new GraphEdge(vertexS, vertexE, 8);
  const edgeSA = new GraphEdge(vertexS, vertexA, 10);
  const edgeED = new GraphEdge(vertexE, vertexD, 1);
  const edgeDA = new GraphEdge(vertexD, vertexA, -4);
  const edgeDC = new GraphEdge(vertexD, vertexC, -1);
  const edgeAC = new GraphEdge(vertexA, vertexC, 2);
  const edgeCB = new GraphEdge(vertexC, vertexB, -2);
  const edgeBA = new GraphEdge(vertexB, vertexA, 1);

  const graph = new Graph(true);
  graph
    .addVertex(vertexH)
    .addEdge(edgeSE)
    .addEdge(edgeSA)
    .addEdge(edgeED)
    .addEdge(edgeDA)
    .addEdge(edgeDC)
    .addEdge(edgeAC)
    .addEdge(edgeCB)
    .addEdge(edgeBA);

  const { distances, previousVertices } = floydWarshall(graph);

  const vertices = graph.getAllVertices();
  t.is(distances[vertices.indexOf(vertexS)][vertices.indexOf(vertexH)][vertices.length], Infinity);
  t.is(distances[vertices.indexOf(vertexS)][vertices.indexOf(vertexS)][vertices.length], 0);
  t.is(distances[vertices.indexOf(vertexS)][vertices.indexOf(vertexA)][vertices.length], 5);
  t.is(distances[vertices.indexOf(vertexS)][vertices.indexOf(vertexB)][vertices.length], 5);
  t.is(distances[vertices.indexOf(vertexS)][vertices.indexOf(vertexC)][vertices.length], 7);
  t.is(distances[vertices.indexOf(vertexS)][vertices.indexOf(vertexD)][vertices.length], 9);
  t.is(distances[vertices.indexOf(vertexS)][vertices.indexOf(vertexE)][vertices.length], 8);

  t.is(previousVertices[vertices.indexOf(vertexS)][vertices.indexOf(vertexH)][vertices.length], null);
  t.is(previousVertices[vertices.indexOf(vertexS)][vertices.indexOf(vertexS)][vertices.length], null);
  t.is(previousVertices[vertices.indexOf(vertexS)][vertices.indexOf(vertexB)][vertices.length], vertexC);
  t.is(previousVertices[vertices.indexOf(vertexS)][vertices.indexOf(vertexC)][vertices.length], vertexA);
  t.is(previousVertices[vertices.indexOf(vertexS)][vertices.indexOf(vertexA)][vertices.length], vertexD);
  t.is(previousVertices[vertices.indexOf(vertexS)][vertices.indexOf(vertexD)][vertices.length], vertexE);

});
