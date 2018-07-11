/**
 * @since 20180711 15:39
 * @author vivaxy
 */

const test = require('ava');
const PrioriryQueue = require('../index.js');

test('priority queue', (t) => {

  const priorityQueue = new PrioriryQueue();

  priorityQueue.add(10, 1).add(5, 2).add(100, 0);

  t.is(priorityQueue.toString(), [100, 5, 10].toString());

  priorityQueue.remove(100);

  t.is(priorityQueue.toString(), [10, 5].toString());

});
